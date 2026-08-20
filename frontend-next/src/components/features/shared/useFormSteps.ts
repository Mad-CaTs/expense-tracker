'use client'

import { useCallback, useState } from 'react'

/**
 * Navegación de un formulario por pasos.
 *
 * Guarda la dirección del último cambio para que el contenido entre del lado
 * correcto (ver `.step-fwd` / `.step-back` en globals.css), y `next` solo avanza
 * si la validación del paso actual pasa — así los errores aparecen donde está
 * el campo, no después.
 */
export function useFormSteps(total = 2) {
  const [step, setStep] = useState(1)
  const [stepDir, setStepDir] = useState<'fwd' | 'back'>('fwd')

  const goNext = useCallback((validate?: () => boolean) => {
    if (validate && !validate()) return
    setStepDir('fwd')
    setStep((s) => Math.min(s + 1, total))
  }, [total])

  const goBack = useCallback(() => {
    setStepDir('back')
    setStep((s) => Math.max(s - 1, 1))
  }, [])

  /** Salta a un paso concreto: al enviar se revalida todo, y si falla algo de
   *  un paso anterior hay que llevar al usuario donde está ese campo. */
  const goTo = useCallback((target: number) => {
    setStep((s) => {
      if (target === s) return s
      setStepDir(target > s ? 'fwd' : 'back')
      return Math.min(Math.max(target, 1), total)
    })
  }, [total])

  return { step, stepDir, goNext, goBack, goTo }
}
