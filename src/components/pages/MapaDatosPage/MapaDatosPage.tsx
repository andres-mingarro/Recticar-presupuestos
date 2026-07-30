"use client";

import { useCallback, useEffect, useState, type MouseEvent } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button, buttonStyles } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  FLUJOS,
  TABLAS,
  ZONAS,
  type AccionPaso,
  type Flujo,
  type Nota,
  type Paso,
} from "./mapa-datos";
import styles from "./MapaDatosPage.module.scss";

const ACCION_LABEL: Record<AccionPaso, string> = {
  escribe: "escribe",
  lee: "lee",
  intacto: "no cambia",
};

function ChipTabla({
  tabla,
  activa,
  onHover,
}: {
  tabla: string;
  activa: boolean;
  onHover: (t: string | null) => void;
}) {
  return (
    <code
      className={cn(styles.chipTabla, activa && styles.chipTablaActiva)}
      onMouseEnter={() => onHover(tabla)}
      onMouseLeave={() => onHover(null)}
    >
      {tabla}
    </code>
  );
}

function PasoItem({
  paso,
  mostrarColumnas,
  tablaHover,
  onHover,
}: {
  paso: Paso;
  mostrarColumnas: boolean;
  tablaHover: string | null;
  onHover: (t: string | null) => void;
}) {
  const resaltado = tablaHover !== null && paso.tabla === tablaHover;

  return (
    <li className={cn(styles.paso, resaltado && styles.pasoResaltado)}>
      <div className={styles.rail} aria-hidden="true">
        <span className={cn(styles.numero, styles[`numero_${paso.accion}`])}>{paso.n}</span>
      </div>

      <div className={styles.pasoCuerpo}>
        <div className={styles.pasoHead}>
          <h3 className={styles.pasoTitulo}>{paso.titulo}</h3>
          <span className={cn(styles.accion, styles[`accion_${paso.accion}`])}>
            {ACCION_LABEL[paso.accion]}
          </span>
          {paso.tabla && (
            <ChipTabla tabla={paso.tabla} activa={resaltado} onHover={onHover} />
          )}
          <span className={styles.zona}>{ZONAS[paso.zona].corto}</span>
        </div>

        <p className={styles.pasoQue}>{paso.que}</p>

        {mostrarColumnas && paso.columnas.length > 0 && (
          <ul className={styles.columnas}>
            {paso.columnas.map((c) => (
              <li key={c}>
                <code>{c}</code>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  );
}

function NotaItem({ nota }: { nota: Nota }) {
  return (
    <li className={cn(styles.nota, styles[`nota_${nota.tono}`])}>
      <div className={styles.rail} aria-hidden="true">
        <span className={styles.notaMarca}>
          <Icon name={nota.tono === "clave" ? "key" : "shieldUser"} className="size-3" />
        </span>
      </div>
      <div className={styles.notaCuerpo}>
        <p className={styles.notaTitulo}>{nota.titulo}</p>
        <p className={styles.notaTexto}>{nota.texto}</p>
      </div>
    </li>
  );
}

function FlujoSection({
  flujo,
  indice,
  mostrarColumnas,
  tablaHover,
  onHover,
}: {
  flujo: Flujo;
  indice: number;
  mostrarColumnas: boolean;
  tablaHover: string | null;
  onHover: (t: string | null) => void;
}) {
  const filas: Array<{ tipo: "paso"; dato: Paso } | { tipo: "nota"; dato: Nota }> = [];
  for (const paso of flujo.pasos) {
    filas.push({ tipo: "paso", dato: paso });
    for (const nota of flujo.notas.filter((n) => n.despuesDe === paso.n)) {
      filas.push({ tipo: "nota", dato: nota });
    }
  }

  return (
    <section id={flujo.id} className={styles.flujo} aria-labelledby={`${flujo.id}-titulo`}>
      <header className={styles.flujoHead}>
        <p className={styles.flujoIndice}>
          Recorrido {indice} de {FLUJOS.length}
        </p>
        <h2 id={`${flujo.id}-titulo`} className={styles.flujoPregunta}>
          {flujo.pregunta}
        </h2>
        <p className={styles.flujoRespuesta}>{flujo.respuesta}</p>
      </header>

      <ol className={styles.pasos}>
        {filas.map((f, i) =>
          f.tipo === "paso" ? (
            <PasoItem
              key={`p-${f.dato.n}`}
              paso={f.dato}
              mostrarColumnas={mostrarColumnas}
              tablaHover={tablaHover}
              onHover={onHover}
            />
          ) : (
            <NotaItem key={`n-${i}`} nota={f.dato} />
          )
        )}
      </ol>

      <footer className={styles.flujoPie}>
        <span className={styles.pieLabel}>En el código</span>
        <ul className={styles.archivos}>
          {flujo.archivos.map((a) => (
            <li key={a}>
              <code>{a}</code>
            </li>
          ))}
        </ul>
      </footer>
    </section>
  );
}

/**
 * Busca el ancestro que realmente scrollea.
 *
 * El AppShell ocupa 100dvh con overflow hidden y el scroll ocurre dentro de
 * `AppMain` (overflow-y-auto), no en la ventana. Escuchar `window` acá no
 * dispara nunca. Se resuelve subiendo por el árbol en vez de hardcodear la
 * clase, para que siga funcionando si cambia el layout.
 */
function contenedorScrollable(el: HTMLElement): HTMLElement | Window {
  let actual = el.parentElement;

  while (actual) {
    const { overflowY } = window.getComputedStyle(actual);
    if (overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay") {
      return actual;
    }
    actual = actual.parentElement;
  }

  return window;
}

/**
 * Marca en el índice el recorrido que se está leyendo.
 *
 * Toma como referencia una línea al 30% del alto visible: el recorrido activo
 * es el último cuyo encabezado ya la cruzó. Resuelve solo el caso de la última
 * sección corta, que con IntersectionObserver queda sin activar nunca.
 */
function useRecorridoActivo(ids: string[]) {
  const [activo, setActivo] = useState(ids[0] ?? "");

  useEffect(() => {
    const secciones = ids
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (secciones.length === 0) return;

    const contenedor = contenedorScrollable(secciones[0]);

    const calcular = () => {
      // getBoundingClientRect es relativo al viewport, así que la línea de
      // referencia también tiene que serlo, venga de la ventana o del contenedor.
      const caja =
        contenedor === window
          ? { top: 0, height: window.innerHeight }
          : (contenedor as HTMLElement).getBoundingClientRect();

      const linea = caja.top + caja.height * 0.3;

      let actual = secciones[0].id;
      for (const seccion of secciones) {
        if (seccion.getBoundingClientRect().top <= linea) actual = seccion.id;
      }
      setActivo(actual);
    };

    let pendiente = false;
    const alScrollear = () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => {
        calcular();
        pendiente = false;
      });
    };

    calcular();
    contenedor.addEventListener("scroll", alScrollear, { passive: true });
    window.addEventListener("resize", alScrollear);
    // Si el destino ya estaba visible, el click no genera scroll: recalcular igual.
    window.addEventListener("hashchange", alScrollear);

    return () => {
      contenedor.removeEventListener("scroll", alScrollear);
      window.removeEventListener("resize", alScrollear);
      window.removeEventListener("hashchange", alScrollear);
    };
  }, [ids]);

  return activo;
}

const FLUJO_IDS = FLUJOS.map((f) => f.id);

export function MapaDatosPage() {
  const [mostrarColumnas, setMostrarColumnas] = useState(false);
  const [tablaHover, setTablaHover] = useState<string | null>(null);
  const activo = useRecorridoActivo(FLUJO_IDS);

  /**
   * Scroll suave hacia el recorrido. Va por JS y no con `scroll-behavior: smooth`
   * porque el contenedor que scrollea es `AppMain`, fuera de este componente:
   * ponerlo en CSS afectaría a toda la app.
   */
  const irARecorrido = useCallback((e: MouseEvent<HTMLAnchorElement>, id: string) => {
    const destino = document.getElementById(id);
    if (!destino) return; // sin destino, que actúe el salto nativo

    e.preventDefault();

    const sinMovimiento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    destino.scrollIntoView({
      behavior: sinMovimiento ? "auto" : "smooth",
      block: "start",
    });

    // replaceState y no el hash directo: no ensucia el historial ni fuerza un salto.
    window.history.replaceState(null, "", `#${id}`);
  }, []);

  return (
    <div className={cn("MapaDatosPage", styles.MapaDatosPage)}>
      <PageHeader
        eyebrow="Estadísticas"
        title="Mapa de datos"
        description="Cuatro recorridos que explican por dónde pasa la información y qué queda escrito en cada paso."
        actions={
          <Link
            href="/estadisticas"
            data-variant="outline-dark"
            className={buttonStyles({ size: "sm", className: "gap-2" })}
          >
            <Icon name="chevronLeft" className="size-3.5" />
            Volver a estadísticas
          </Link>
        }
      />

      <div className={styles.layout}>
        <nav className={styles.indice} aria-label="Recorridos">
          <p className={styles.indiceLabel}>Recorridos</p>
          <ol className={styles.indiceLista}>
            {FLUJOS.map((f, i) => (
              <li key={f.id}>
                <a
                  href={`#${f.id}`}
                  onClick={(e) => irARecorrido(e, f.id)}
                  aria-current={activo === f.id ? "true" : undefined}
                  className={cn(
                    styles.indiceLink,
                    activo === f.id && styles.indiceLinkActivo
                  )}
                >
                  <span className={styles.indiceNum}>{i + 1}</span>
                  <span>
                    <span className={styles.indiceNombre}>{f.nombre}</span>
                    <span className={styles.indicePregunta}>{f.pregunta}</span>
                  </span>
                </a>
              </li>
            ))}
          </ol>

          <Button
            variant={mostrarColumnas ? "primary" : "outline"}
            size="sm"
            className="w-full"
            onClick={() => setMostrarColumnas((v) => !v)}
            icon={<Icon name={mostrarColumnas ? "eyeSlash" : "eye"} className="size-3.5" />}
          >
            {mostrarColumnas ? "Ocultar columnas" : "Mostrar columnas"}
          </Button>
        </nav>

        <div className={styles.contenido}>
          {FLUJOS.map((f, i) => (
            <FlujoSection
              key={f.id}
              flujo={f}
              indice={i + 1}
              mostrarColumnas={mostrarColumnas}
              tablaHover={tablaHover}
              onHover={setTablaHover}
            />
          ))}

          <section className={styles.glosario} aria-labelledby="glosario-titulo">
            <h2 id="glosario-titulo" className={styles.glosarioTitulo}>
              Las tablas, en una línea cada una
            </h2>
            <dl className={styles.glosarioLista}>
              {TABLAS.map((t) => (
                <div
                  key={t.tabla}
                  className={cn(
                    styles.glosarioFila,
                    tablaHover === t.tabla && styles.glosarioFilaActiva
                  )}
                >
                  <dt>
                    <code
                      className={styles.chipTabla}
                      onMouseEnter={() => setTablaHover(t.tabla)}
                      onMouseLeave={() => setTablaHover(null)}
                    >
                      {t.tabla}
                    </code>
                    <span className={styles.zona}>{ZONAS[t.zona].corto}</span>
                  </dt>
                  <dd>{t.que}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
