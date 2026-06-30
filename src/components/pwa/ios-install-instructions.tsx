"use client";

import { motion } from "framer-motion";
import { Share2, Plus, CheckCircle2, ArrowDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface IOSInstallInstructionsProps {
  shopName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Optional theme colour used for step number badges (e.g. "#e11d48") */
  themeColor?: string;
}

const steps = [
  {
    icon: Share2,
    title: "Touchez le bouton Partager",
    description:
      "Touchez l'icône de partage dans la barre de navigation en bas de l'écran.",
    hintIcon: ArrowDown,
  },
  {
    icon: Plus,
    title: 'Faites défiler et touchez "Sur l\'écran d\'accueil"',
    description:
      "Dans le menu de partage, faites défiler vers le bas et sélectionnez l'option « Sur l'écran d'accueil ».",
    hintIcon: null,
  },
  {
    icon: CheckCircle2,
    title: 'Touchez "Ajouter" pour confirmer',
    description:
      "Confirmez l'ajout en touchant le bouton « Ajouter » en haut à droite.",
    hintIcon: null,
  },
] as const;

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.12 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export function IOSInstallInstructions({
  shopName,
  open,
  onOpenChange,
  themeColor = "#000000",
}: IOSInstallInstructionsProps) {
  const badgeStyle = { backgroundColor: themeColor };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg">
            Installez {shopName} sur votre iPhone
          </DialogTitle>
          <DialogDescription>
            Suivez ces 3 étapes simples pour ajouter l&apos;application à votre
            écran d&apos;accueil.
          </DialogDescription>
        </DialogHeader>

        <motion.ol
          variants={containerVariants}
          initial="hidden"
          animate={open ? "visible" : "hidden"}
          className="mt-2 flex flex-col gap-5"
        >
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const HintIcon = step.hintIcon;
            return (
              <motion.li
                key={idx}
                variants={itemVariants}
                className="flex items-start gap-3"
              >
                {/* Step number badge */}
                <span
                  style={badgeStyle}
                  className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                >
                  {idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {step.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>

                {/* Icon + optional hint */}
                <div className="relative flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-muted">
                  <Icon className="h-5 w-5 text-foreground" />
                  {HintIcon && (
                    <HintIcon className="absolute -bottom-1.5 left-1/2 h-4 w-4 -translate-x-1/2 text-foreground/60" />
                  )}
                </div>
              </motion.li>
            );
          })}
        </motion.ol>

        <DialogFooter className="mt-2">
          <DialogClose asChild>
            <Button className="w-full sm:w-auto">J&apos;ai compris</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}