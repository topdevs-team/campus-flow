'use client'

/* eslint-disable @typescript-eslint/no-explicit-any */
// Re-export CardSwap.jsx with proper TypeScript types
import _CardSwap, { Card as _Card } from './CardSwap'
import React from 'react'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  customClass?: string
  children?: React.ReactNode
}

export interface CardSwapProps {
  width?: number
  height?: number
  cardDistance?: number
  verticalDistance?: number
  delay?: number
  pauseOnHover?: boolean
  onCardClick?: (index: number) => void
  skewAmount?: number
  easing?: string
  children: React.ReactNode
}

export const Card = _Card as unknown as React.ForwardRefExoticComponent<CardProps & React.RefAttributes<HTMLDivElement>>
const CardSwap = _CardSwap as unknown as React.FC<CardSwapProps>
export default CardSwap
