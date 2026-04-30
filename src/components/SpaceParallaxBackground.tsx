import type { CSSProperties } from "react";

type SpaceParallaxBackgroundProps = {
    scrollY: number;
};

/** Deep space base — synced with vignette / fade / index `--background` */
const VOID = "#142847";
/** Matches VOID for gradient alphas */
const VOID_RGB = "20, 40, 71";

const NEBULA_LAYERS = `
  radial-gradient(ellipse 92% 62% at 14% 24%, rgba(220, 95, 45, 0.44) 0%, transparent 54%),
  radial-gradient(ellipse 78% 52% at 78% 30%, rgba(251, 166, 59, 0.36) 0%, transparent 50%),
  radial-gradient(ellipse 88% 58% at 68% 76%, rgba(185, 72, 28, 0.32) 0%, transparent 54%),
  radial-gradient(ellipse 74% 50% at 90% 16%, rgba(72, 220, 235, 0.28) 0%, transparent 48%),
  radial-gradient(ellipse 80% 64% at 52% 74%, rgba(56, 195, 235, 0.24) 0%, transparent 56%),
  radial-gradient(ellipse 102% 84% at 40% 44%, rgba(88, 62, 158, 0.36) 0%, transparent 58%),
  radial-gradient(ellipse 130% 98% at 50% 108%, rgba(${VOID_RGB}, 0.58) 0%, transparent 58%),
  radial-gradient(ellipse 96% 74% at 50% -10%, rgba(38, 62, 112, 0.42) 0%, transparent 46%)
`;

type Speck =
    | readonly [number, number, number]
    | readonly [number, number, number, number, number, number];

/** Deterministic field so SSR/build match client */
function starField(
    count: number,
    seed: number,
    alphaMin: number,
    alphaMax: number
): [number, number, number][] {
    let s = seed % 2147483646;
    if (s <= 0) s += 2147483645;
    const rnd = () => {
        s = (s * 16807) % 2147483647;
        return (s - 1) / 2147483646;
    };
    const out: [number, number, number][] = [];
    for (let i = 0; i < count; i++) {
        out.push([
            rnd() * 100,
            rnd() * 100,
            alphaMin + rnd() * (alphaMax - alphaMin),
        ]);
    }
    return out;
}

/**
 * Hero headshot (~centered, ~43–44% from top). Ellipse in viewport % matches
 * the circular avatar so background specks never land “inside” the photo.
 */
function excludeSpecksUnderHeroHeadshot(specks: Speck[]): Speck[] {
    const cx = 50;
    const cy = 43;
    const rx = 13;
    const ry = 14;
    return specks.filter((spec) => {
        const x = spec[0];
        const y = spec[1];
        const dx = (x - cx) / rx;
        const dy = (y - cy) / ry;
        return dx * dx + dy * dy > 1;
    });
}

/** Distant dust — many faint points */
const STAR_SPECKS_FAR = excludeSpecksUnderHeroHeadshot(
    starField(58, 90_210, 0.14, 0.34),
);

/** Mid depth */
const STAR_SPECKS_MID = excludeSpecksUnderHeroHeadshot(
    starField(46, 31_415, 0.32, 0.62),
);

/** Brighter, fewer — foreground sparkle */
const STAR_SPECKS_NEAR = excludeSpecksUnderHeroHeadshot(
    starField(28, 27_182, 0.48, 0.82),
);

/** Few high-contrast “jewel” stars + subtle cyan/lavender tints */
const STAR_SPECKS_BRIGHT: Speck[] = excludeSpecksUnderHeroHeadshot([
    ...starField(14, 42_424, 0.78, 0.98),
    [8, 14, 0.72, 210, 238, 255],
    [91, 8, 0.68, 230, 218, 255],
    [72, 88, 0.75, 255, 248, 235],
    [48, 28, 0.82, 255, 255, 255],
    [63, 41, 0.88, 255, 255, 255],
    [14, 91, 0.76, 245, 235, 255],
    [86, 74, 0.8, 255, 255, 255],
]);

function speckGradients(specks: readonly Speck[], sizePx: number): string {
    return specks
        .map((spec) => {
            const [x, y, a, r = 255, g = 255, b = 255] = spec;
            return `radial-gradient(${sizePx}px ${sizePx}px at ${x}% ${y}%, rgba(${r},${g},${b},${a}), transparent)`;
        })
        .join(", ");
}

/** Fixed cosmic backdrop: nebula parallax + star speckle + blueprint-style white geometry */
export function SpaceParallaxBackground({
    scrollY,
}: SpaceParallaxBackgroundProps) {
    const nebulaY = scrollY * 0.07;
    const geoY = scrollY * 0.14;
    const starsFarY = scrollY * 0.011;
    const starsMidY = scrollY * 0.027;
    const starsNearY = scrollY * 0.05;
    const starsBrightY = scrollY * 0.038;

    const nebulaStyle: CSSProperties = {
        transform: `translate3d(0, ${nebulaY}px, 0)`,
        willChange: "transform",
        background: NEBULA_LAYERS,
    };

    return (
        <div
            className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
            aria-hidden
        >
            <div className="absolute inset-0" style={{ background: VOID }} />

            <div
                className="absolute inset-[-40%] opacity-100"
                style={nebulaStyle}
            />

            {/* Soft vignette — lighter than before so nebula color reads */}
            <div
                className="absolute inset-0 opacity-[0.38]"
                style={{
                    background: `radial-gradient(ellipse 72% 62% at 50% 42%, transparent 38%, ${VOID} 86%)`,
                }}
            />

            {/* Parallax stars — far / mid / near / bright; larger specks + higher layer opacity */}
            <div
                className="absolute inset-0 opacity-[0.82]"
                style={{
                    transform: `translate3d(0, ${starsFarY}px, 0)`,
                    willChange: "transform",
                    backgroundImage: speckGradients(STAR_SPECKS_FAR, 1.2),
                    backgroundSize: "100% 100%",
                }}
            />
            <div
                className="absolute inset-0 opacity-[0.78]"
                style={{
                    transform: `translate3d(0, ${starsMidY}px, 0)`,
                    willChange: "transform",
                    backgroundImage: speckGradients(STAR_SPECKS_MID, 1.5),
                    backgroundSize: "100% 100%",
                }}
            />
            <div
                className="absolute inset-0 opacity-[0.72]"
                style={{
                    transform: `translate3d(0, ${starsNearY}px, 0)`,
                    willChange: "transform",
                    backgroundImage: speckGradients(STAR_SPECKS_NEAR, 2.1),
                    backgroundSize: "100% 100%",
                }}
            />
            <div
                className="absolute inset-0 opacity-[0.95]"
                style={{
                    transform: `translate3d(0, ${starsBrightY}px, 0)`,
                    willChange: "transform",
                    backgroundImage: speckGradients(STAR_SPECKS_BRIGHT, 2.85),
                    backgroundSize: "100% 100%",
                }}
            />

            {/* Geometric white-line layer (inspired by technical / diamond layouts) */}
            <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                    transform: `translate3d(0, ${geoY}px, 0)`,
                    willChange: "transform",
                }}
            >
                <svg
                    className="h-[min(140vmin,920px)] w-full max-w-[1100px] opacity-[0.9]"
                    viewBox="0 0 1000 620"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <defs>
                        <pattern
                            id="space-grid-fine"
                            width="14"
                            height="14"
                            patternUnits="userSpaceOnUse"
                        >
                            <circle
                                cx="1.2"
                                cy="1.2"
                                r="0.45"
                                fill="white"
                                opacity="0.2"
                            />
                        </pattern>
                    </defs>

                    {/* Large diamond + inner grid */}
                    <g stroke="white" strokeWidth="1.15" opacity="0.38">
                        <rect
                            x="320"
                            y="110"
                            width="360"
                            height="360"
                            transform="rotate(45 500 290)"
                            strokeDasharray="4 7"
                        />
                        <rect
                            x="355"
                            y="145"
                            width="290"
                            height="290"
                            transform="rotate(45 500 290)"
                            fill="url(#space-grid-fine)"
                            opacity="0.35"
                        />
                        <rect
                            x="275"
                            y="65"
                            width="450"
                            height="450"
                            transform="rotate(45 500 290)"
                            strokeWidth="0.85"
                            opacity="0.22"
                        />
                    </g>
                </svg>
            </div>

            {/* Top fade — hides the hard edge when parallax layers shift down */}
            <div
                className="pointer-events-none absolute top-0 right-0 left-0 h-[min(35vh,280px)]"
                style={{
                    background: `linear-gradient(to bottom, ${VOID} 0%, rgba(${VOID_RGB},0.42) 48%, transparent 100%)`,
                }}
            />

            {/* Scroll fade into solid void for lower sections */}
            <div
                className="pointer-events-none absolute right-0 bottom-0 left-0 h-[min(40vh,320px)]"
                style={{
                    background: `linear-gradient(to top, ${VOID} 0%, rgba(${VOID_RGB},0.42) 48%, transparent 100%)`,
                }}
            />

            {/* Subtle cinematic grain over the full backdrop */}
            <div className="space-film-grain" />
        </div>
    );
}
