import { CARDS, type CardId } from "@/lib/spendings"
import { cn } from "@/lib/utils"

/**
 * Monochrome on purpose. The category badge sitting next to it in the row
 * already owns the colour, so a tinted circle here would only muddy the row.
 * Main is the common case and stays quiet; Bill is the one being scanned
 * for, so it is the filled one.
 */
const CARD_STYLES: Record<CardId, string> = {
  main: "bg-muted text-muted-foreground ring-1 ring-border ring-inset",
  bill: "bg-foreground/85 text-background",
}

export function CardBadge({
  card,
  className,
}: {
  card: CardId
  className?: string
}) {
  const { name, initial } = CARDS.find(({ id }) => id === card) ?? CARDS[0]

  return (
    <span
      role="img"
      aria-label={`${name} card`}
      title={`${name} card`}
      className={cn(
        "inline-flex size-5 shrink-0 items-center justify-center rounded-full text-[10px] leading-none font-semibold",
        CARD_STYLES[card],
        className
      )}
    >
      {initial}
    </span>
  )
}
