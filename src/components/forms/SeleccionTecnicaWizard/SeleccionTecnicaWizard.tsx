"use client";

import { useCallback, useMemo, useState } from "react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Marca, Modelo, ModeloMotorRelation, Motor } from "@/lib/types";
import { getBrandLogoUrl } from "@/lib/vehicle-logo";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/Carousel";
import styles from "./SeleccionTecnicaWizard.module.scss";

type EmblaApi = UseEmblaCarouselType[1];

type Props = {
  marcas: Marca[];
  modelos: Modelo[];
  motores: Motor[];
  relations: ModeloMotorRelation[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (marcaId: string, modeloId: string, motorId: string) => void;
  initialMarcaId?: string;
  initialModeloId?: string;
  initialMotorId?: string;
  initialStep?: number;
};

const STEPS = [
  { label: "Marca", num: "1" },
  { label: "Modelo", num: "2" },
  { label: "Motor", num: "3" },
] as const;

function BrandLogo({ nombre }: { nombre: string }) {
  const url = getBrandLogoUrl(nombre);
  if (url) {
    return (
      <div className={styles.logoWrapper}>
        <Image src={url} alt={nombre} width={64} height={48} className={styles.logoImg} unoptimized />
      </div>
    );
  }
  return (
    <div className={styles.logoFallback}>
      <span>{nombre[0].toUpperCase()}</span>
    </div>
  );
}

export function SeleccionTecnicaWizard({
  marcas,
  modelos,
  motores,
  relations,
  open,
  onOpenChange,
  onSelect,
  initialMarcaId = "",
  initialModeloId = "",
  initialMotorId = "",
  initialStep = 0,
}: Props) {
  const [step, setStep] = useState(initialStep);
  const [marcaId, setMarcaId] = useState(initialMarcaId);
  const [modeloId, setModeloId] = useState(initialModeloId);
  const [motorId, setMotorId] = useState(initialMotorId);
  const [emblaApi, setEmblaApi] = useState<EmblaApi>(undefined);

  const handleSetApi = useCallback((api: EmblaApi) => {
    setEmblaApi(api);
    api?.on("select", () => setStep(api.selectedScrollSnap()));
    api?.on("init", () => {
      if (initialStep > 0) api.scrollTo(initialStep, true);
    });
  }, [initialStep]);

  const goTo = useCallback((nextStep: number) => {
    setStep(nextStep);
    emblaApi?.scrollTo(nextStep, true);
  }, [emblaApi]);

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setStep(initialStep);
      setMarcaId(initialMarcaId);
      setModeloId(initialModeloId);
      setMotorId(initialMotorId);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          emblaApi?.scrollTo(initialStep, true);
          setStep(initialStep);
        });
      });
    }
    onOpenChange(isOpen);
  };

  const modelosFiltrados = useMemo(
    () => modelos.filter((m) => String(m.marca_id) === marcaId),
    [modelos, marcaId]
  );

  const motoresIds = useMemo(
    () => relations.filter((r) => String(r.modelo_id) === modeloId).map((r) => r.motor_id),
    [relations, modeloId]
  );

  const motoresFiltrados = useMemo(
    () => motores.filter((m) => motoresIds.includes(m.id)),
    [motores, motoresIds]
  );

  const marcaNombre = useMemo(() => marcas.find((m) => String(m.id) === marcaId)?.nombre, [marcas, marcaId]);
  const modeloNombre = useMemo(() => modelos.find((m) => String(m.id) === modeloId)?.nombre, [modelos, modeloId]);

  const handleSelectMarca = (id: string) => { setMarcaId(id); setModeloId(""); setMotorId(""); goTo(1); };
  const handleSelectModelo = (id: string) => { setModeloId(id); setMotorId(""); goTo(2); };
  const handleSelectMotor = (id: string) => { setMotorId(id); onSelect(marcaId, modeloId, id); onOpenChange(false); };

  const canGoBack = step > 0;
  const canGoNext = step < 2 && ((step === 0 && !!marcaId) || (step === 1 && !!modeloId));

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          {/* Step pills */}
          <div className={styles.stepIndicator}>
            {STEPS.map((s, i) => (
              <div key={s.label} className="contents">
                {i > 0 && <div className={styles.stepDivider} />}
                <div className={cn(
                  styles.stepPill,
                  i === step && styles.stepPillActive,
                  i < step && styles.stepPillDone,
                )}>
                  <span className={styles.stepPillNumber}>{s.num}</span>
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          <DialogTitle>{STEPS[step].label}</DialogTitle>

          {/* Breadcrumb de contexto */}
          {(step >= 1 && marcaNombre) || (step >= 2 && modeloNombre) ? (
            <div className={styles.contextBar}>
              {marcaNombre && (
                <>
                  <span className={styles.contextItem}>{marcaNombre}</span>
                  {step >= 2 && modeloNombre && (
                    <>
                      <span className={styles.contextSep}>›</span>
                      <span className={styles.contextItem}>{modeloNombre}</span>
                    </>
                  )}
                </>
              )}
            </div>
          ) : null}
        </DialogHeader>

        <Carousel setApi={handleSetApi} className={styles.carousel}>
          <CarouselContent>
            {/* Paso 1: Marcas */}
            <CarouselItem>
              <div className={styles.brandGrid}>
                {marcas.map((marca) => (
                  <button
                    key={marca.id}
                    type="button"
                    onClick={() => handleSelectMarca(String(marca.id))}
                    className={cn(styles.brandCard, String(marca.id) === marcaId && styles.brandCardSelected)}
                  >
                    <BrandLogo nombre={marca.nombre} />
                    <span className={styles.brandName}>{marca.nombre}</span>
                  </button>
                ))}
              </div>
            </CarouselItem>

            {/* Paso 2: Modelos */}
            <CarouselItem>
              {modelosFiltrados.length === 0 ? (
                <p className={styles.emptyMessage}>Sin modelos para esta marca.</p>
              ) : (
                <div className={styles.listGrid}>
                  {modelosFiltrados.map((modelo) => (
                    <button
                      key={modelo.id}
                      type="button"
                      onClick={() => handleSelectModelo(String(modelo.id))}
                      className={cn(styles.listItem, String(modelo.id) === modeloId && styles.listItemSelected)}
                    >
                      <span>{modelo.nombre}</span>
                      <svg viewBox="0 0 24 24" className={styles.listItemChevron} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </CarouselItem>

            {/* Paso 3: Motores */}
            <CarouselItem>
              {motoresFiltrados.length === 0 ? (
                <p className={styles.emptyMessage}>Sin motores para este modelo.</p>
              ) : (
                <div className={styles.listGrid}>
                  {motoresFiltrados.map((motor) => (
                    <button
                      key={motor.id}
                      type="button"
                      onClick={() => handleSelectMotor(String(motor.id))}
                      className={cn(styles.listItem, String(motor.id) === motorId && styles.listItemSelected)}
                    >
                      <span>{motor.nombre}</span>
                      <svg viewBox="0 0 24 24" className={styles.listItemChevron} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </button>
                  ))}
                </div>
              )}
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            className="flex-1"
            onClick={() => goTo(step - 1)}
            disabled={!canGoBack}
            icon={<Icon name="chevronLeft" className="h-4 w-4" />}
          >
            Atrás
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => goTo(step + 1)}
            disabled={!canGoNext}
            iconRight={<Icon name="chevronRight" className="h-4 w-4" />}
          >
            Adelante
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
