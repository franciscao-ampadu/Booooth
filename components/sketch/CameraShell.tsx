import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The hand-drawn camera that frames the login and sign-up forms: the form sits
 * on the LCD, and the shutter button on top submits it.
 */
export default function CameraShell({
  formId,
  shutterLabel,
  shutterAriaLabel,
  shutterDisabled,
  shooting,
  children,
}: {
  formId: string;
  shutterLabel: string;
  shutterAriaLabel: string;
  shutterDisabled: boolean;
  shooting: boolean;
  children: ReactNode;
}) {
  return (
    <div className={`camera${shooting ? " shooting" : ""}`}>
      <div className="shutter-wrap">
        <span className="shutter-label">{shutterLabel}</span>
        <button
          type="submit"
          form={formId}
          className="shutter"
          aria-label={shutterAriaLabel}
          disabled={shutterDisabled}
        />
      </div>

      <div className="mode-dial" aria-hidden />

      <div className="camera-body wobble-a">
        <div className="camera-top">
          <div className="eyepiece" aria-hidden />
          <h1 className="camera-title">
            <Link href="/">BOOOOTH</Link>
          </h1>
          <div className="camera-flash-window hatch" aria-hidden />
        </div>

        <div className="camera-back">
          <div className="lcd wobble-c">{children}</div>

          <div className="controls" aria-hidden>
            <div className="dpad">
              <div className="dpad-center" />
            </div>
            <div className="small-buttons">
              <span />
              <span />
            </div>
            <div className="thumb-grip" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Plays the shutter sound; browsers may block it, which is fine. */
export function playShutter() {
  const sound = new Audio("/sounds/login-shutter.mp3");
  sound.play().catch(() => {});
}

/** Wait for the camera-zoom + flash animation before navigating away. */
export const SHUTTER_ANIMATION_MS = 700;
