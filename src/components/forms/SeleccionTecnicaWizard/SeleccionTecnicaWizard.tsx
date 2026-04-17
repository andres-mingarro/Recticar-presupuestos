"use client";

import { useCallback, useMemo, useState } from "react";
import type { UseEmblaCarouselType } from "embla-carousel-react";
import Image from "next/image";
import { cn } from "@/lib/cn";
import type { Marca, Modelo, ModeloMotorRelation, Motor } from "@/lib/types";
import { getBrandLogoUrl } from "@/lib/vehicle-logo";
import { buttonStyles } from "@/components/ui/Button";
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

const STEPS = ["Marca", "Modelo", "Motor"] as const;

function BrandLogo({ nombre }: { nombre: string }) {
  const url = getBrandLogoUrl(nombre);
  if (url) {
    return (
      <div className={styles.logoWrapper}>
        <Image src={url} alt={nombre} width={80} height={60} className={styles.logoImg} unoptimized />
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
    api?.on("select", () => {
      setStep(api.selectedScrollSnap());
    });
    api?.on("init", () => {
      if (initialStep > 0) api.scrollTo(initialStep, true);
    });
  }, [initialStep]);

  const goTo = useCallback(
    (nextStep: number) => {
      setStep(nextStep);
      emblaApi?.scrollTo(nextStep, true);
    },
    [emblaApi]
  );

  const handleOpen = (isOpen: boolean) => {
    if (isOpen) {
      setStep(initialStep);
      setMarcaId(initialMarcaId);
      setModeloId(initialModeloId);
      setMotorId(initialMotorId);
      // Esperar a que el dialog termine de animar y embla esté listo
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
    () =>
      relations
        .filter((r) => String(r.modelo_id) === modeloId)
        .map((r) => r.motor_id),
    [relations, modeloId]
  );

  const motoresFiltrados = useMemo(
    () => motores.filter((m) => motoresIds.includes(m.id)),
    [motores, motoresIds]
  );

  const handleSelectMarca = (id: string) => {
    setMarcaId(id);
    setModeloId("");
    setMotorId("");
    goTo(1);
  };

  const handleSelectModelo = (id: string) => {
    setModeloId(id);
    setMotorId("");
    goTo(2);
  };

  const handleSelectMotor = (id: string) => {
    setMotorId(id);
    onSelect(marcaId, modeloId, id);
    onOpenChange(false);
  };

  const canGoBack = step > 0;
  const canGoNext = step < 2 && (
    (step === 0 && !!marcaId) ||
    (step === 1 && !!modeloId)
  );

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className={styles.dialogContent}>
        <DialogHeader>
          <div className={styles.stepIndicator}>
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={cn(styles.stepDot, i === step && styles.stepDotActive, i < step && styles.stepDotDone)}
              />
            ))}
          </div>
          <DialogTitle>{STEPS[step]}</DialogTitle>
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
                    className={cn(
                      styles.brandCard,
                      String(marca.id) === marcaId && styles.brandCardSelected
                    )}
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
                      className={cn(
                        styles.listItem,
                        String(modelo.id) === modeloId && styles.listItemSelected
                      )}
                    >
                      {modelo.nombre}
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
                      className={cn(
                        styles.listItem,
                        String(motor.id) === motorId && styles.listItemSelected
                      )}
                    >
                      {motor.nombre}
                    </button>
                  ))}
                </div>
              )}
            </CarouselItem>
          </CarouselContent>
        </Carousel>

        <DialogFooter>
          <button
            type="button"
            onClick={() => goTo(step - 1)}
            disabled={!canGoBack}
            className={buttonStyles({ variant: "secondary", className: "flex-1 gap-2" })}
          >
            <Icon name="chevronLeft" className="h-4 w-4" />
            Atrás
          </button>
          <button
            type="button"
            onClick={() => goTo(step + 1)}
            disabled={!canGoNext}
            className={buttonStyles({ className: "flex-1 gap-2" })}
          >
            Adelante
            <Icon name="chevronRight" className="h-4 w-4" />
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
