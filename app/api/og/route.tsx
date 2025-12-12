import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;

  // Get parameters
  const type = searchParams.get("type") || "default"; // stake, win, first, poll
  const title = searchParams.get("title") || "ShowStakr";
  const amount = searchParams.get("amount");
  const username = searchParams.get("username") || "Player";
  const poolSize = searchParams.get("pool");
  const players = searchParams.get("players");
  const topOption = searchParams.get("option");
  const percentage = searchParams.get("percentage");

  // Luxurious black theme colors
  const colors = {
    bg: "#000000",
    card: "#0A0A0A",
    border: "#1F1F1F",
    subtle: "#151515",
    textPrimary: "#EDEDED",
    textSecondary: "#D8D8D8",
    textMuted: "#9A9A9A",
    emerald: "#10B981",
    amber: "#F59E0B",
    cyan: "#22D3D3",
  };

  // Stake placed template
  if (type === "stake") {
    return new ImageResponse(
      (
        <div
          style={{
            background: colors.bg,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            position: "relative",
          }}
        >
          {/* Subtle radial glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "500px",
              height: "500px",
              background:
                "radial-gradient(circle, rgba(31,31,31,0.4) 0%, transparent 70%)",
              borderRadius: "50%",
              display: "flex",
            }}
          />

          {/* Corner accents */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: "40px",
              width: "60px",
              height: "60px",
              borderTop: `1px solid ${colors.border}`,
              borderLeft: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "40px",
              width: "60px",
              height: "60px",
              borderTop: `1px solid ${colors.border}`,
              borderRight: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "40px",
              width: "60px",
              height: "60px",
              borderBottom: `1px solid ${colors.border}`,
              borderLeft: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              right: "40px",
              width: "60px",
              height: "60px",
              borderBottom: `1px solid ${colors.border}`,
              borderRight: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />

          {/* Logo */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: colors.textPrimary,
              letterSpacing: "-0.02em",
              marginBottom: "40px",
              display: "flex",
            }}
          >
            ShowStakr
          </div>

          {/* Badge */}
          <div
            style={{
              fontSize: "14px",
              color: colors.emerald,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "16px",
              display: "flex",
            }}
          >
            Stake Placed
          </div>

          {/* Amount */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: "600",
              color: colors.textPrimary,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
              display: "flex",
              alignItems: "baseline",
              gap: "12px",
            }}
          >
            <span style={{ display: "flex" }}>{amount || "0"}</span>
            <span
              style={{
                fontSize: "32px",
                color: colors.textMuted,
                display: "flex",
              }}
            >
              USDC
            </span>
          </div>

          {/* Username */}
          <div
            style={{
              fontSize: "18px",
              color: colors.textMuted,
              marginBottom: "32px",
              display: "flex",
            }}
          >
            by {username}
          </div>

          {/* Poll title */}
          <div
            style={{
              fontSize: "20px",
              color: colors.textSecondary,
              textAlign: "center",
              maxWidth: "600px",
              lineHeight: "1.4",
              display: "flex",
            }}
          >
            {title}
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "48px",
              fontSize: "13px",
              color: colors.textMuted,
              letterSpacing: "0.05em",
              display: "flex",
            }}
          >
            showstakr.com
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Win template
  if (type === "win") {
    return new ImageResponse(
      (
        <div
          style={{
            background: colors.bg,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            position: "relative",
          }}
        >
          {/* Subtle amber glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "500px",
              height: "500px",
              background:
                "radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)",
              borderRadius: "50%",
              display: "flex",
            }}
          />

          {/* Corner accents */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: "40px",
              width: "60px",
              height: "60px",
              borderTop: `1px solid ${colors.border}`,
              borderLeft: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "40px",
              width: "60px",
              height: "60px",
              borderTop: `1px solid ${colors.border}`,
              borderRight: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "40px",
              width: "60px",
              height: "60px",
              borderBottom: `1px solid ${colors.border}`,
              borderLeft: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              right: "40px",
              width: "60px",
              height: "60px",
              borderBottom: `1px solid ${colors.border}`,
              borderRight: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />

          {/* Logo */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: colors.textPrimary,
              letterSpacing: "-0.02em",
              marginBottom: "40px",
              display: "flex",
            }}
          >
            ShowStakr
          </div>

          {/* Badge */}
          <div
            style={{
              fontSize: "14px",
              color: colors.amber,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              marginBottom: "16px",
              display: "flex",
            }}
          >
            Winner
          </div>

          {/* Amount */}
          <div
            style={{
              fontSize: "72px",
              fontWeight: "600",
              color: colors.amber,
              letterSpacing: "-0.02em",
              marginBottom: "16px",
              display: "flex",
              alignItems: "baseline",
              gap: "12px",
            }}
          >
            <span style={{ display: "flex" }}>+{amount || "0"}</span>
            <span
              style={{
                fontSize: "32px",
                color: colors.textMuted,
                display: "flex",
              }}
            >
              USDC
            </span>
          </div>

          {/* Username */}
          <div
            style={{
              fontSize: "18px",
              color: colors.textMuted,
              marginBottom: "32px",
              display: "flex",
            }}
          >
            won by {username}
          </div>

          {/* Poll title */}
          <div
            style={{
              fontSize: "20px",
              color: colors.textSecondary,
              textAlign: "center",
              maxWidth: "600px",
              lineHeight: "1.4",
              display: "flex",
            }}
          >
            {title}
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "48px",
              fontSize: "13px",
              color: colors.textMuted,
              letterSpacing: "0.05em",
              display: "flex",
            }}
          >
            showstakr.com
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // First prediction template
  if (type === "first") {
    return new ImageResponse(
      (
        <div
          style={{
            background: colors.bg,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            position: "relative",
          }}
        >
          {/* Subtle cyan glow */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "500px",
              height: "500px",
              background:
                "radial-gradient(circle, rgba(34,211,211,0.06) 0%, transparent 70%)",
              borderRadius: "50%",
              display: "flex",
            }}
          />

          {/* Corner accents */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: "40px",
              width: "60px",
              height: "60px",
              borderTop: `1px solid ${colors.border}`,
              borderLeft: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "40px",
              width: "60px",
              height: "60px",
              borderTop: `1px solid ${colors.border}`,
              borderRight: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "40px",
              width: "60px",
              height: "60px",
              borderBottom: `1px solid ${colors.border}`,
              borderLeft: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              right: "40px",
              width: "60px",
              height: "60px",
              borderBottom: `1px solid ${colors.border}`,
              borderRight: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />

          {/* Logo */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: colors.textPrimary,
              letterSpacing: "-0.02em",
              marginBottom: "48px",
              display: "flex",
            }}
          >
            ShowStakr
          </div>

          {/* Main text */}
          <div
            style={{
              fontSize: "56px",
              fontWeight: "600",
              color: colors.cyan,
              letterSpacing: "-0.02em",
              marginBottom: "24px",
              display: "flex",
            }}
          >
            First Prediction
          </div>

          {/* Username */}
          <div
            style={{
              fontSize: "24px",
              color: colors.textSecondary,
              marginBottom: "16px",
              display: "flex",
            }}
          >
            {username} just joined
          </div>

          {/* Tagline */}
          <div
            style={{
              fontSize: "18px",
              color: colors.textMuted,
              display: "flex",
            }}
          >
            Predict. Stack wins.
          </div>

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "48px",
              fontSize: "13px",
              color: colors.textMuted,
              letterSpacing: "0.05em",
              display: "flex",
            }}
          >
            showstakr.com
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Poll share template
  if (type === "poll") {
    return new ImageResponse(
      (
        <div
          style={{
            background: colors.bg,
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
            position: "relative",
            padding: "60px",
          }}
        >
          {/* Grid lines */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "0",
              width: "100%",
              height: "1px",
              background: `linear-gradient(to right, transparent, ${colors.border} 20%, ${colors.border} 80%, transparent)`,
              opacity: "0.5",
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "0",
              left: "50%",
              width: "1px",
              height: "100%",
              background: `linear-gradient(to bottom, transparent, ${colors.border} 20%, ${colors.border} 80%, transparent)`,
              opacity: "0.5",
              display: "flex",
            }}
          />

          {/* Corner accents */}
          <div
            style={{
              position: "absolute",
              top: "40px",
              left: "40px",
              width: "60px",
              height: "60px",
              borderTop: `1px solid ${colors.border}`,
              borderLeft: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40px",
              right: "40px",
              width: "60px",
              height: "60px",
              borderTop: `1px solid ${colors.border}`,
              borderRight: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              left: "40px",
              width: "60px",
              height: "60px",
              borderBottom: `1px solid ${colors.border}`,
              borderLeft: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "40px",
              right: "40px",
              width: "60px",
              height: "60px",
              borderBottom: `1px solid ${colors.border}`,
              borderRight: `1px solid ${colors.border}`,
              display: "flex",
            }}
          />

          {/* Logo */}
          <div
            style={{
              fontSize: "28px",
              fontWeight: "600",
              color: colors.textPrimary,
              letterSpacing: "-0.02em",
              marginBottom: "48px",
              display: "flex",
            }}
          >
            ShowStakr
          </div>

          {/* Poll title */}
          <div
            style={{
              fontSize: "40px",
              fontWeight: "600",
              color: colors.textPrimary,
              textAlign: "center",
              marginBottom: "40px",
              maxWidth: "900px",
              lineHeight: "1.3",
              letterSpacing: "-0.02em",
              display: "flex",
            }}
          >
            {title}
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "flex",
              gap: "64px",
              marginBottom: "40px",
            }}
          >
            {poolSize && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "600",
                    color: colors.emerald,
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                  }}
                >
                  <span style={{ display: "flex" }}>{poolSize}</span>
                  <span
                    style={{
                      fontSize: "18px",
                      color: colors.textMuted,
                      display: "flex",
                    }}
                  >
                    USDC
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: colors.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginTop: "4px",
                    display: "flex",
                  }}
                >
                  Pool
                </div>
              </div>
            )}
            {players && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "36px",
                    fontWeight: "600",
                    color: colors.textPrimary,
                    display: "flex",
                  }}
                >
                  {players}
                </div>
                <div
                  style={{
                    fontSize: "13px",
                    color: colors.textMuted,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    marginTop: "4px",
                    display: "flex",
                  }}
                >
                  Players
                </div>
              </div>
            )}
          </div>

          {/* Top option if provided */}
          {topOption && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
                padding: "16px 32px",
                background: colors.subtle,
                borderRadius: "12px",
                border: `1px solid ${colors.border}`,
              }}
            >
              <div
                style={{
                  fontSize: "18px",
                  color: colors.textSecondary,
                  display: "flex",
                }}
              >
                {topOption}
              </div>
              {percentage && (
                <div
                  style={{
                    fontSize: "18px",
                    fontWeight: "600",
                    color: colors.cyan,
                    display: "flex",
                  }}
                >
                  {percentage}%
                </div>
              )}
            </div>
          )}

          {/* Footer */}
          <div
            style={{
              position: "absolute",
              bottom: "48px",
              fontSize: "13px",
              color: colors.textMuted,
              letterSpacing: "0.05em",
              display: "flex",
            }}
          >
            showstakr.com
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  // Default template
  return new ImageResponse(
    (
      <div
        style={{
          background: colors.bg,
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "system-ui, -apple-system, sans-serif",
          position: "relative",
        }}
      >
        {/* Subtle glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "500px",
            height: "500px",
            background:
              "radial-gradient(circle, rgba(31,31,31,0.5) 0%, transparent 70%)",
            borderRadius: "50%",
            display: "flex",
          }}
        />

        {/* Corner accents */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            width: "60px",
            height: "60px",
            borderTop: `1px solid ${colors.border}`,
            borderLeft: `1px solid ${colors.border}`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: "40px",
            right: "40px",
            width: "60px",
            height: "60px",
            borderTop: `1px solid ${colors.border}`,
            borderRight: `1px solid ${colors.border}`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            left: "40px",
            width: "60px",
            height: "60px",
            borderBottom: `1px solid ${colors.border}`,
            borderLeft: `1px solid ${colors.border}`,
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            right: "40px",
            width: "60px",
            height: "60px",
            borderBottom: `1px solid ${colors.border}`,
            borderRight: `1px solid ${colors.border}`,
            display: "flex",
          }}
        />

        {/* Logo */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: "600",
            color: colors.textPrimary,
            letterSpacing: "-0.02em",
            marginBottom: "20px",
            display: "flex",
          }}
        >
          ShowStakr
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "24px",
            color: colors.textMuted,
            letterSpacing: "0.02em",
            display: "flex",
          }}
        >
          Predict. Stack wins.
        </div>

        {/* Footer */}
        <div
          style={{
            position: "absolute",
            bottom: "48px",
            fontSize: "13px",
            color: colors.textMuted,
            letterSpacing: "0.05em",
            display: "flex",
          }}
        >
          showstakr.com
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
