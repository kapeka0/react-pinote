import { useEffect, useId, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { createPortal } from "react-dom";
import { PinoteTrigger } from "./pinote-trigger";
import { pinoteTriggerStyle } from "./pinote-trigger-style";
import { pinoteClip, pinoteCorner, pinoteRadius } from "./pinote-shape";
import { usePinotePosition } from "./use-pinote-position";
import { usePortalTheme } from "./use-portal-theme";
import { usePresence } from "./use-presence";
import type { PinoteAppearance, PinotePosition } from "./types";
import type { PinoteInteraction } from "./use-pinote-interaction";

type SurfaceProps = PinoteAppearance & {
  children?: ReactNode;
  interaction: PinoteInteraction;
  point: PinotePosition;
  attached: boolean;
  highlight: boolean;
  draggable: boolean;
};

/** Owns placement, presentation and the handoff between marker and content. */
export function PinoteSurface({
  children,
  interaction,
  point,
  attached,
  highlight,
  draggable,
  content,
  author,
  header,
  leading,
  triggerAside,
  authorPlacement = "inside",
  icon,
  render,
  animation,
  variant = "popover",
  orientation = "auto",
  entranceAnimation = "pop",
  color,
  style,
  className,
  "aria-label": label,
}: SurfaceProps) {
  const {
    context,
    isOpen,
    focusVisible,
    dragging,
    rootRef,
    anchorRef,
    triggerRef,
    contentRef,
    focusContent,
  } = interaction;
  const Root = attached && !highlight ? "div" : "span";
  const contentId = useId();
  const expand = variant === "expand";
  const corner = pinoteCorner(orientation, point, attached);
  const cardRadius = pinoteRadius(
    corner,
    "var(--pinote-radius,var(--radius,12px))",
  );
  const appearance = { "--pn-bg": color, ...style } as CSSProperties;
  const visible = usePresence(isOpen, contentRef);
  const [entered, setEntered] = useState(false);
  const openTarget = isOpen && entered;
  const motion = animation ?? context.animation;
  const portalRoot = context.portal ? context.portalContainer : false;
  const floating = usePinotePosition(
    visible && !dragging,
    anchorRef,
    contentRef,
    portalRoot,
    point,
    expand ? corner : false,
  );
  const clip = pinoteClip(
    corner,
    cardRadius,
    render ? floating.anchorSize : undefined,
  );
  usePortalTheme(visible, rootRef, contentRef, portalRoot);

  const leadingRef = useRef<HTMLElement | null>(null);
  const [leadingFrom, setLeadingFrom] = useState("none");
  // Only presentation knows how the leading visual is arranged in the panel.
  // Positioning supplies geometry, without querying author-specific markup.
  useEffect(() => {
    const visual = leadingRef.current;
    if (expand && visual)
      setLeadingFrom(
        `translate(${floating.anchorCenter.x - visual.offsetLeft - visual.offsetWidth / 2}px,${floating.anchorCenter.y - visual.offsetTop - visual.offsetHeight / 2}px)`,
      );
  }, [expand, floating, leading, author?.avatarUrl]);
  const focusedOpen = useRef(false);
  const focusOrigin = useRef<Element | null>(null);
  useEffect(() => {
    if (!isOpen || !context.persistent) {
      focusedOpen.current = false;
      focusOrigin.current = null;
    } else focusOrigin.current ??= document.activeElement;
    if (!visible) {
      setEntered(false);
      return;
    }
    if (!isOpen || floating.style.visibility === "hidden") return;
    const focus = () => {
      if (context.persistent && !focusedOpen.current) {
        focusedOpen.current = true;
        // Preserve a focus change made while placement or the frame was pending.
        if (document.activeElement === focusOrigin.current) focusContent();
      }
    };
    if (entered) {
      focus();
      return;
    }
    const frame = requestAnimationFrame(() => {
      setEntered(true);
      focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [
    isOpen,
    visible,
    entered,
    floating.style.visibility,
    context.persistent,
    focusContent,
  ]);

  const heading = header === undefined ? author?.name : header;
  const hasLeading =
    leading !== undefined ? leading != null : !!author?.avatarUrl;
  const leadingStyle: CSSProperties | undefined = expand
    ? {
        gridRow: "1",
        alignSelf: "center",
        transform: openTarget ? "none" : leadingFrom,
        transition: "inherit",
      }
    : undefined;
  const reveal: CSSProperties | undefined = expand
    ? { opacity: openTarget ? 1 : 0, transition: "inherit" }
    : undefined;
  const panel =
    visible && !dragging ? (
      <div
        {...interaction.panelProps}
        aria-label={label ?? (author ? `${author.name}'s pinote` : "Pinote")}
        className={`pn pn-c ${className ?? ""}`}
        data-animation={motion === "none" ? "none" : expand ? "expand" : motion}
        data-leaving={!isOpen ? "" : undefined}
        aria-hidden={!isOpen ? true : undefined}
        data-side={floating.side}
        data-slot="pinote-content"
        id={contentId}
        ref={(node) => {
          contentRef.current = node;
          node?.toggleAttribute("inert", !isOpen);
        }}
        role="dialog"
        tabIndex={-1}
        style={{
          overscrollBehavior: "contain",
          cursor: expand ? "pointer" : undefined,
          outline: expand && focusVisible ? "auto" : undefined,
          ...(!isOpen && {
            "--pn-d": "var(--pinote-collapse-duration,220ms)",
            "--pn-e": "var(--pinote-easing,cubic-bezier(.4,0,.2,1))",
          }),
          ...(expand
            ? {
                ...(isOpen && {
                  "--pn-d": "var(--pinote-expand-duration,160ms)",
                }),
                clipPath: openTarget ? `inset(0 round ${cardRadius})` : clip,
                borderRadius: cardRadius,
                opacity: 1,
                display: "grid",
                gridTemplateColumns: hasLeading ? "auto 1fr" : "1fr",
                columnGap: 8,
                rowGap: 2,
              }
            : {
                opacity: openTarget ? 1 : 0,
                transform:
                  !openTarget && motion === "scale"
                    ? "scale(var(--pinote-content-scale,.96))"
                    : !openTarget && motion === "slide"
                      ? "translateY(var(--pinote-slide-distance,6px))"
                      : "none",
              }),
          transitionDuration: motion === "none" || !entered ? "0s" : undefined,
          pointerEvents: isOpen ? "auto" : "none",
          ...appearance,
          ...floating.style,
          ...(expand
            ? ({ position: "relative", left: 0, top: 0 } as CSSProperties)
            : {}),
        }}
      >
        {(heading != null || hasLeading) && (
          <div
            data-slot={
              header === undefined && leading === undefined && author
                ? "pinote-author"
                : "pinote-header"
            }
            style={{
              display: expand ? "contents" : "flex",
              transition: expand ? "inherit" : undefined,
              alignItems: "center",
              gap: 8,
              marginBottom: 10,
              fontWeight: 600,
            }}
          >
            {leading !== undefined
              ? leading != null && (
                  <span
                    data-slot="pinote-leading"
                    className="pn-l"
                    ref={(node) => {
                      leadingRef.current = node;
                    }}
                    style={leadingStyle}
                  >
                    {leading}
                  </span>
                )
              : author?.avatarUrl && (
                  <img
                    alt=""
                    className="pn-v"
                    data-slot="pinote-avatar"
                    ref={(node) => {
                      leadingRef.current = node;
                    }}
                    src={author.avatarUrl}
                    style={leadingStyle}
                  />
                )}
            {heading != null &&
              (header === undefined ? (
                <bdi style={reveal}>{heading}</bdi>
              ) : (
                <div style={reveal}>{heading}</div>
              ))}
          </div>
        )}
        <div
          data-slot="pinote-body"
          style={
            expand
              ? { gridColumn: hasLeading ? 2 : undefined, ...reveal }
              : undefined
          }
        >
          {content}
        </div>
      </div>
    ) : null;
  // The shadow must remain outside the clipped, expanding surface.
  const surface =
    expand && panel ? (
      <div
        style={{
          ...floating.style,
          filter: "var(--pinote-expand-shadow,drop-shadow(0 2px 3px #0002))",
          zIndex: 50,
          // Only the visible clipping surface receives input. The shadow's
          // rectangle must not uncover/recover the trigger at viewport edges.
          pointerEvents: "none",
        }}
      >
        {panel}
      </div>
    ) : (
      panel
    );
  return (
    <>
      <Root
        className={`pn ${attached ? `pn-w ${highlight ? "pn-h" : ""}` : "pn-p"} ${className ?? ""}`}
        data-slot={
          highlight
            ? "pinote-highlight"
            : attached
              ? "pinote-attachment"
              : "pinote"
        }
        data-state={interaction.isOpen ? "open" : "closed"}
        ref={(node) => {
          interaction.rootRef.current = node;
        }}
        style={
          {
            ...appearance,
            ...(attached
              ? {
                  position: "relative",
                  display: "inline-block",
                  maxWidth: "100%",
                  ...(highlight ? { textBox: "trim-both cap alphabetic" } : {}),
                }
              : {
                  position: "absolute",
                  translate: "-50% -50%",
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                }),
          } as CSSProperties
        }
        {...(highlight ? interaction.hoverProps : {})}
        onBlur={interaction.blur}
      >
        {highlight ? (
          <span data-slot="pinote-highlight-text" onClick={interaction.toggle}>
            {children}
          </span>
        ) : (
          children
        )}
        <span
          ref={anchorRef}
          className="pn-a"
          data-slot="pinote-anchor"
          {...(!highlight && !render ? interaction.hoverProps : {})}
          style={{
            display: "inline-grid",
            verticalAlign: "middle",
            ...(attached
              ? {
                  position: "absolute",
                  left: `${point.x}%`,
                  top: `${point.y}%`,
                  translate: highlight
                    ? `${point.x < 50 ? "-100%" : point.x > 50 ? "0" : "-50%"} ${point.y <= 50 ? "-100%" : "0"}`
                    : "-50% -50%",
                }
              : {}),
          }}
        >
          <PinoteTrigger
            {...interaction.triggerProps}
            {...(render ? interaction.hoverProps : {})}
            render={render}
            state={{ ...interaction.state, isDragging: dragging }}
            author={author}
            triggerAside={triggerAside}
            authorPlacement={authorPlacement}
            icon={icon}
            aria-controls={isOpen ? contentId : undefined}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-label={
              label ??
              (render
                ? undefined
                : author
                  ? `Open pinote from ${author.name}`
                  : "Open pinote")
            }
            data-slot="pinote-trigger"
            data-state={isOpen ? "open" : "closed"}
            data-orientation={corner}
            data-entrance={context.ready ? entranceAnimation : "none"}
            data-draggable={draggable ? "" : undefined}
            className={render ? "pn-r" : "pn-t"}
            style={pinoteTriggerStyle({
              draggable,
              expand,
              hidden: expand && visible && entered,
              entering: !context.ready && entranceAnimation === "pop",
              highlight: highlight ? point : undefined,
              custom: !!render,
              corner,
            })}
            triggerRef={triggerRef}
            type="button"
          />
        </span>
      </Root>
      {surface &&
        (context.portal
          ? createPortal(surface, context.portalContainer ?? document.body)
          : surface)}
    </>
  );
}
