'use client'

import { useState, useRef, useEffect } from 'react'
import type { ReviewStatus } from '@/lib/types'
import { STATUS_OPTIONS } from '@/lib/types'

interface StatusStepperProps {
  currentStatus: ReviewStatus
  onStatusChange: (status: ReviewStatus) => void
  disabled?: boolean
  compact?: boolean // for mobile
}

const statusMeta: Record<ReviewStatus, {
  icon: string
  color: string
  bgActive: string
  bgInactive: string
  borderActive: string
  borderInactive: string
  textActive: string
  textInactive: string
  glowColor: string
  dotBg: string
}> = {
  Pending: {
    icon: '⏳',
    color: '#f59e0b',
    bgActive: 'rgba(245, 158, 11, 0.15)',
    bgInactive: 'rgba(255, 255, 255, 0.02)',
    borderActive: 'rgba(245, 158, 11, 0.35)',
    borderInactive: 'rgba(255, 255, 255, 0.06)',
    textActive: '#fbbf24',
    textInactive: '#52525b',
    glowColor: 'rgba(245, 158, 11, 0.2)',
    dotBg: '#f59e0b',
  },
  'In Progress': {
    icon: '🔄',
    color: '#3b82f6',
    bgActive: 'rgba(59, 130, 246, 0.15)',
    bgInactive: 'rgba(255, 255, 255, 0.02)',
    borderActive: 'rgba(59, 130, 246, 0.35)',
    borderInactive: 'rgba(255, 255, 255, 0.06)',
    textActive: '#60a5fa',
    textInactive: '#52525b',
    glowColor: 'rgba(59, 130, 246, 0.2)',
    dotBg: '#3b82f6',
  },
  Done: {
    icon: '✓',
    color: '#10b981',
    bgActive: 'rgba(16, 185, 129, 0.15)',
    bgInactive: 'rgba(255, 255, 255, 0.02)',
    borderActive: 'rgba(16, 185, 129, 0.35)',
    borderInactive: 'rgba(255, 255, 255, 0.06)',
    textActive: '#34d399',
    textInactive: '#52525b',
    glowColor: 'rgba(16, 185, 129, 0.2)',
    dotBg: '#10b981',
  },
}

export default function StatusStepper({
  currentStatus,
  onStatusChange,
  disabled = false,
  compact = false,
}: StatusStepperProps) {
  const [hoveredStep, setHoveredStep] = useState<ReviewStatus | null>(null)
  const [showTooltip, setShowTooltip] = useState<ReviewStatus | null>(null)
  const tooltipTimer = useRef<NodeJS.Timeout | null>(null)

  const currentIndex = STATUS_OPTIONS.indexOf(currentStatus)

  function handleStepClick(status: ReviewStatus) {
    if (disabled || status === currentStatus) return
    onStatusChange(status)
  }

  function handleMouseEnter(status: ReviewStatus) {
    setHoveredStep(status)
    tooltipTimer.current = setTimeout(() => {
      setShowTooltip(status)
    }, 400)
  }

  function handleMouseLeave() {
    setHoveredStep(null)
    setShowTooltip(null)
    if (tooltipTimer.current) {
      clearTimeout(tooltipTimer.current)
      tooltipTimer.current = null
    }
  }

  useEffect(() => {
    return () => {
      if (tooltipTimer.current) clearTimeout(tooltipTimer.current)
    }
  }, [])

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {STATUS_OPTIONS.map((status, i) => {
          const meta = statusMeta[status]
          const isActive = i <= currentIndex
          const isCurrent = status === currentStatus
          const isHovered = hoveredStep === status

          return (
            <div key={status} className="flex items-center gap-1">
              <button
                onClick={() => handleStepClick(status)}
                onMouseEnter={() => handleMouseEnter(status)}
                onMouseLeave={handleMouseLeave}
                disabled={disabled}
                title={`Set to ${status}`}
                className="relative group"
                style={{
                  background: isActive ? meta.bgActive : meta.bgInactive,
                  border: `1px solid ${isActive ? meta.borderActive : meta.borderInactive}`,
                  borderRadius: '8px',
                  padding: '4px 10px',
                  cursor: disabled ? 'not-allowed' : 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHovered && !disabled ? 'scale(1.05)' : 'scale(1)',
                  boxShadow: isCurrent ? `0 0 12px ${meta.glowColor}` : 'none',
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: isActive ? meta.textActive : meta.textInactive,
                    letterSpacing: '0.02em',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isCurrent && (
                    <span
                      style={{
                        display: 'inline-block',
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: meta.dotBg,
                        marginRight: '5px',
                        verticalAlign: 'middle',
                        animation: status === 'Pending' ? 'pulse-soft 2s ease-in-out infinite' : undefined,
                      }}
                    />
                  )}
                  {status}
                </span>
              </button>

              {/* Connector */}
              {i < STATUS_OPTIONS.length - 1 && (
                <div
                  style={{
                    width: '12px',
                    height: '2px',
                    borderRadius: '1px',
                    background: i < currentIndex
                      ? `linear-gradient(90deg, ${statusMeta[STATUS_OPTIONS[i]].color}, ${statusMeta[STATUS_OPTIONS[i + 1]].color})`
                      : 'rgba(255, 255, 255, 0.06)',
                    transition: 'all 0.4s ease',
                  }}
                />
              )}
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-0.5">
      {STATUS_OPTIONS.map((status, i) => {
        const meta = statusMeta[status]
        const isActive = i <= currentIndex
        const isCurrent = status === currentStatus
        const isPast = i < currentIndex
        const isHovered = hoveredStep === status
        const isClickable = !disabled && status !== currentStatus

        return (
          <div key={status} className="flex items-center gap-0.5">
            {/* Step button */}
            <div className="relative">
              <button
                onClick={() => handleStepClick(status)}
                onMouseEnter={() => handleMouseEnter(status)}
                onMouseLeave={handleMouseLeave}
                disabled={disabled}
                aria-label={`Set status to ${status}`}
                aria-current={isCurrent ? 'step' : undefined}
                className="relative group"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: isActive ? meta.bgActive : isHovered ? 'rgba(255,255,255,0.04)' : meta.bgInactive,
                  border: `1px solid ${isActive ? meta.borderActive : isHovered ? 'rgba(255,255,255,0.1)' : meta.borderInactive}`,
                  borderRadius: '10px',
                  padding: '5px 12px',
                  cursor: isClickable ? 'pointer' : disabled ? 'not-allowed' : 'default',
                  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                  transform: isHovered && isClickable ? 'translateY(-1px)' : 'translateY(0)',
                  boxShadow: isCurrent
                    ? `0 0 16px ${meta.glowColor}, 0 2px 8px rgba(0,0,0,0.2)`
                    : isHovered && isClickable
                      ? '0 2px 8px rgba(0,0,0,0.15)'
                      : 'none',
                  opacity: disabled ? 0.4 : 1,
                }}
              >
                {/* Status indicator dot / check */}
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: isActive ? `${meta.color}22` : 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${isActive ? meta.color : 'rgba(255,255,255,0.1)'}`,
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                >
                  {isPast ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 5L4.2 7.5L8 2.5"
                        stroke={meta.color}
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : isCurrent ? (
                    <span
                      style={{
                        width: '7px',
                        height: '7px',
                        borderRadius: '50%',
                        background: meta.color,
                        animation: status === 'Pending' ? 'pulse-soft 2s ease-in-out infinite' : undefined,
                      }}
                    />
                  ) : (
                    <span
                      style={{
                        width: '5px',
                        height: '5px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.1)',
                      }}
                    />
                  )}
                </span>

                {/* Label */}
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: isCurrent ? 700 : isActive ? 600 : 500,
                    color: isActive ? meta.textActive : isHovered ? '#a1a1aa' : meta.textInactive,
                    letterSpacing: '0.01em',
                    whiteSpace: 'nowrap',
                    transition: 'color 0.2s ease',
                  }}
                >
                  {status}
                </span>
              </button>

              {/* Tooltip */}
              {showTooltip === status && isClickable && (
                <div
                  className="animate-scaleIn"
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    marginBottom: '6px',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    background: 'rgba(24, 24, 27, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)',
                    zIndex: 50,
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span style={{ fontSize: '11px', color: '#a1a1aa' }}>
                    Click to set <strong style={{ color: meta.textActive }}>{status}</strong>
                  </span>
                  {/* Tooltip arrow */}
                  <div
                    style={{
                      position: 'absolute',
                      bottom: '-4px',
                      left: '50%',
                      transform: 'translateX(-50%) rotate(45deg)',
                      width: '8px',
                      height: '8px',
                      background: 'rgba(24, 24, 27, 0.95)',
                      borderRight: '1px solid rgba(255,255,255,0.1)',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                    }}
                  />
                </div>
              )}
            </div>

            {/* Connector line between steps */}
            {i < STATUS_OPTIONS.length - 1 && (
              <div
                style={{
                  position: 'relative',
                  width: '20px',
                  height: '2px',
                  borderRadius: '1px',
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.06)',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    height: '100%',
                    width: i < currentIndex ? '100%' : '0%',
                    background: `linear-gradient(90deg, ${statusMeta[STATUS_OPTIONS[i]].color}, ${statusMeta[STATUS_OPTIONS[i + 1]].color})`,
                    borderRadius: '1px',
                    transition: 'width 0.5s cubic-bezier(0.16, 1, 0.3, 1)',
                  }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
