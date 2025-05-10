import * as React from "react"
import { Slot } from "@radix-ui/react-slot"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '0.375rem',
      fontSize: '0.875rem',
      fontWeight: '500',
      transition: 'background-color 150ms, color 150ms',
      cursor: 'pointer',
      ...style
    }

    // Size styles
    const sizeStyles: Record<string, React.CSSProperties> = {
      default: { height: '2.5rem', padding: '0.5rem 1rem' },
      sm: { height: '2.25rem', padding: '0.25rem 0.75rem' },
      lg: { height: '2.75rem', padding: '0.5rem 2rem' },
      icon: { height: '2.5rem', width: '2.5rem', padding: '0' }
    }

    // Variant styles
    const variantStyles: Record<string, React.CSSProperties> = {
      default: {
        backgroundColor: 'var(--primary)',
        color: 'var(--primary-foreground)'
      },
      destructive: {
        backgroundColor: 'var(--destructive)',
        color: 'var(--destructive-foreground)'
      },
      outline: {
        backgroundColor: 'transparent',
        color: 'var(--foreground)',
        border: '1px solid var(--input)'
      },
      secondary: {
        backgroundColor: 'var(--secondary)',
        color: 'var(--secondary-foreground)'
      },
      ghost: {
        backgroundColor: 'transparent',
        color: 'var(--foreground)'
      },
      link: {
        backgroundColor: 'transparent',
        color: 'var(--primary)',
        textDecoration: 'underline',
        textUnderlineOffset: '4px'
      }
    }

    const combinedStyle = {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant]
    }

    return (
      <Comp
        style={combinedStyle}
        className={className}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
