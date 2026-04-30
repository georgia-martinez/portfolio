import { SpaceParallaxBackground } from "@/components/SpaceParallaxBackground";
import type { SVGProps } from "react";
import { useEffect, useRef, useState } from "react";
import cohortfinderThumb from "./assets/cohortfinder.png";
import headshot from "./assets/headshot.png";
import mandarinThumb from "./assets/mandarin.png";
import omnichordDemoVideo from "./assets/omnichord_demo.mp4";
import wikidashThumb from "./assets/wikidash.png";

const LINKEDIN_URL = "https://www.linkedin.com/in/georgia-martinez-5bb4a8197/";
const GITHUB_URL = "https://github.com/georgia-martinez";
/** PDF in `public/` — respects Vite `base` on GitHub Pages */
const RESUME_URL = `${import.meta.env.BASE_URL}resume.pdf`;

/** Returns embeddable video id for youtube.com / youtu.be URLs, else null */
function youtubeVideoIdFromUrl(url: string): string | null {
    try {
        const u = new URL(url);
        if (u.hostname === "youtu.be") {
            const id = u.pathname.replace(/^\//, "").split("/")[0];
            return id || null;
        }
        if (
            u.hostname === "www.youtube.com" ||
            u.hostname === "youtube.com" ||
            u.hostname === "m.youtube.com"
        ) {
            if (u.pathname === "/watch") return u.searchParams.get("v");
            const m = u.pathname.match(/^\/embed\/([^/?]+)/);
            if (m) return m[1] ?? null;
        }
    } catch {
        return null;
    }
    return null;
}

type OpenVideo =
    | { kind: "file"; src: string }
    | { kind: "youtube"; videoId: string };

const PROJECTS: {
    title: string;
    meta?: string;
    description: string;
    skills?: string[];
    image?: string;
    imageAlt?: string;
    /** Local file URL (bundled) or YouTube watch/share URL — opens in the same modal */
    video?: string;
    href?: string;
    hrefLabel?: string;
    /** Second button below the primary CTA (e.g. article alongside GitHub) */
    hrefSecondary?: string;
    hrefSecondaryLabel?: string;
}[] = [
    {
        title: "Mandarin Lab",
        description:
            "As a chinese adoptee, I've always wanted to learn Mandarin. I tried other tools like Quizlet and Anki to study, but wasn't fully satisfied with either, so I built my own React / Electron app tailored to studying Mandarin including flashcards, and other exercises.",
        skills: ["React", "Electron", "TypeScript", "Material UI"],
        image: mandarinThumb,
        imageAlt: "Mandarin Lab app screenshot",
        href: "https://github.com/georgia-martinez/learn-mandarin",
    },
    {
        title: "WikiDash",
        meta: "2026 Atomic Object Accelerator Hackathon Winner",
        description:
            "A React site where players race from one Wikipedia page to another using only links inside articles, with a global leaderboard powered by Convex. CI/CD with GitHub Actions builds Docker images and deploys to Fly.io for staging and production. Built with my coworkers Maya Malavasi and Sydney Cole.",
        skills: [
            "React",
            "TypeScript",
            "Convex",
            "Docker",
            "Fly.io",
            "GitHub Actions",
        ],
        image: wikidashThumb,
        imageAlt: "WikiDash app screenshot",
        href: "https://github.com/georgia-martinez/wiki-dash",
    },
    {
        title: "Omnichord iPad App",
        description:
            "A virtual Omnichord built with React Native for the iPad. Used Omnichords go for hundreds of dollars... so I built my own for free! It can play major, minor, diminished, augmented and seventh chords in all twelve keys. It also includes a gesture-responsive strumplate for arpeggiation. The audio was synthesized programmatically with react-native-audio-api.",
        skills: ["React Native", "TypeScript", "react-native-audio-api"],
        video: omnichordDemoVideo,
        href: "https://github.com/georgia-martinez/omnichord",
        hrefSecondary:
            "https://spin.atomicobject.com/recreate-omnichord-for-ipad/",
        hrefSecondaryLabel: "Read the article",
    },
    {
        title: "Lampi Looper",
        meta: "CSDS 377: Intro to Connected Devices @ CWRU",
        description:
            "My senior year, I built a drum machine as my final project for CSDS 377. The device was built using a Raspberry Pi 3, a PiTFT touchscreen, and Python using the Kivy UI.",
        skills: ["Python", "Raspberry Pi", "Kivy"],
        video: "https://youtu.be/e7pAVc51mv0",
        href: "https://github.com/georgia-martinez/lampi-looper",
    },
    {
        title: "Training U-net Models for Rectal Cancer",
        meta: "Center for AI Enabling Discovery in Disease Biology @ CWRU",
        description:
            "As a research assistant, I trained U-net models on rectal cancer MRI volumes. Using Python, I evaluated the models and built 3D tumor visualizations using Plotly. I published my research as the second author to the npj Imaging journal in 2024.",
        skills: ["Python", "Jupyter Notebook"],
        image: cohortfinderThumb,
        imageAlt: "CohortFinder figure from the publication",
        href: "https://www.nature.com/articles/s44303-024-00018-2",
        hrefLabel: "Read the paper",
    },
    {
        title: "MATE ROV Underwater Robotics",
        meta: "CWRUbotix Software Team @ CWRU",
        description:
            "I was on my college's underwater robotics team for three years where I programmed underwater ROVs to compete in the MATE ROV Underwater Robotics Competition. The robot was coded using Python, OpenCV, the Robot Operating System (ROS) and was controlled with a PS5 controller. In the 2023 competition, we placed 6th overall internationally out of 20 schools.",
        skills: ["Python", "ROS", "OpenCV", "PyQt5"],
        video: "https://youtu.be/_62vMe6Fqu0",
        href: "https://github.com/CWRUbotix/rov-22",
    },
];

/** Padding, border, and content width — keep About and Projects in sync */
const SECTION_SHELL =
    "relative border border-white/10 bg-space-card/88 px-8 py-16 backdrop-blur-xl sm:px-10 sm:py-20";
const SECTION_INNER = "mx-auto max-w-4xl text-left";

const NAV_ITEMS = [
    { label: "Home", href: "#top" },
    { label: "About", href: "#about" },
    { label: "Projects", href: "#projects" },
] as const;

/** Floating pill — glass on void; ion accent on hover */
const NAV_PILL_LINK =
    "inline-flex shrink-0 items-center rounded-full px-4 py-2 text-sm font-medium text-zinc-200 transition-colors hover:bg-white/10 hover:text-ion-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ion-400 sm:px-5";

/** LinkedIn + GitHub — circular icons; translucent cyan hover */
const HERO_SOCIAL_ICON_LINK =
    "flex size-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 text-zinc-100 shadow-lg transition-all duration-200 hover:border-github-highlight hover:bg-[rgba(118,209,225,0.22)] hover:text-github-highlight hover:backdrop-blur-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-github-highlight";

/** Resume — pill (same hover language as icons), aligned height */
const HERO_RESUME_LINK =
    "inline-flex h-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/8 px-6 text-sm font-semibold tracking-tight text-zinc-100 shadow-lg transition-all duration-200 hover:border-github-highlight hover:bg-[rgba(118,209,225,0.22)] hover:text-github-highlight hover:backdrop-blur-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-github-highlight sm:px-7 sm:text-base";

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
    );
}

function PlayIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
            <path d="M8 5v14l11-7z" />
        </svg>
    );
}

function CloseIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden
            {...props}
        >
            <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
    return (
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
            />
        </svg>
    );
}

const projectCtaClassMedia =
    "inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/15 bg-transparent px-4 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-ion-400/50 hover:bg-ion-400/10 hover:text-ion-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ion-400";

const projectCtaClassFallback =
    "inline-flex w-full max-w-xs items-center justify-center gap-2 rounded-full border border-white/15 bg-transparent px-4 py-2.5 text-sm font-medium text-zinc-100 transition-colors hover:border-ion-400/50 hover:bg-ion-400/10 hover:text-ion-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ion-400";

function ProjectCtaLink({
    href,
    hrefLabel,
    className,
}: {
    href: string;
    hrefLabel?: string;
    className: string;
}) {
    const isGithub = href.includes("github.com");
    return (
        <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
        >
            {isGithub ? (
                <>
                    <GitHubIcon className="size-4 shrink-0" aria-hidden />
                    <span>GitHub</span>
                </>
            ) : (
                hrefLabel ?? "Link"
            )}
        </a>
    );
}

function ProjectCtaGroup({
    href,
    hrefLabel,
    hrefSecondary,
    hrefSecondaryLabel,
    className,
}: {
    href?: string;
    hrefLabel?: string;
    hrefSecondary?: string;
    hrefSecondaryLabel?: string;
    className: string;
}) {
    if (!href && !hrefSecondary) return null;
    return (
        <div className="flex flex-col gap-2">
            {href ? (
                <ProjectCtaLink
                    href={href}
                    hrefLabel={hrefLabel}
                    className={className}
                />
            ) : null}
            {hrefSecondary ? (
                <ProjectCtaLink
                    href={hrefSecondary}
                    hrefLabel={hrefSecondaryLabel}
                    className={className}
                />
            ) : null}
        </div>
    );
}

function App() {
    const [scrollY, setScrollY] = useState(0);
    const [openVideo, setOpenVideo] = useState<OpenVideo | null>(null);
    const modalVideoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        const el = modalVideoRef.current;
        if (!openVideo || openVideo.kind !== "file" || !el) return;
        void el.play().catch(() => {
            /* autoplay may be blocked until user gesture — modal open counts */
        });
        return () => {
            el.pause();
            el.currentTime = 0;
        };
    }, [openVideo]);

    useEffect(() => {
        if (!openVideo) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpenVideo(null);
        };
        window.addEventListener("keydown", onKey);
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            window.removeEventListener("keydown", onKey);
            document.body.style.overflow = prevOverflow;
        };
    }, [openVideo]);

    return (
        <>
            <SpaceParallaxBackground scrollY={scrollY} />
            {openVideo ? (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-space-void/85 p-4 backdrop-blur-md"
                    role="presentation"
                    onClick={() => setOpenVideo(null)}
                >
                    <div
                        className="relative w-full max-w-4xl overflow-hidden border border-white/15 bg-space-card shadow-xl shadow-black/40"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Video demo"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-end bg-space-card px-2 py-2 sm:px-3">
                            <button
                                type="button"
                                aria-label="Close video"
                                className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-zinc-300 transition-colors hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ion-400"
                                onClick={() => setOpenVideo(null)}
                            >
                                <CloseIcon className="size-5" />
                            </button>
                        </div>
                        <div className="p-2 sm:p-3">
                            {openVideo.kind === "youtube" ? (
                                <div className="relative mx-auto aspect-video w-full max-h-[min(85vh,720px)] bg-black">
                                    <iframe
                                        title="YouTube video demo"
                                        src={`https://www.youtube.com/embed/${openVideo.videoId}?autoplay=1&rel=0`}
                                        className="absolute inset-0 size-full"
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                        allowFullScreen
                                    />
                                </div>
                            ) : (
                                <video
                                    ref={modalVideoRef}
                                    src={openVideo.src}
                                    controls
                                    playsInline
                                    className="mx-auto max-h-[min(85vh,720px)] w-full bg-black object-contain"
                                />
                            )}
                        </div>
                    </div>
                </div>
            ) : null}
            <header className="pointer-events-none fixed top-0 right-0 left-0 z-40 flex justify-center px-4 pt-4 sm:pt-5">
                <nav
                    className="pointer-events-auto flex max-w-[min(100%,28rem)] items-center overflow-x-auto rounded-full border border-white/12 bg-space-card/92 shadow-[0_12px_40px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.06)_inset] backdrop-blur-xl [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:max-w-none"
                    aria-label="Primary"
                >
                    <ul className="flex w-full min-w-0 list-none items-center justify-center gap-0.5 py-1 pr-1 pl-1 sm:gap-1 sm:py-1.5 sm:pr-2 sm:pl-2">
                        {NAV_ITEMS.map(({ label, href }) => (
                            <li key={href} className="shrink-0">
                                <a href={href} className={NAV_PILL_LINK}>
                                    {label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            </header>
            <main className="relative z-10 w-full">
                <section
                    id="top"
                    className="hero-intro flex min-h-svh flex-col px-6 pt-[max(5.25rem,env(safe-area-inset-top,0px))] text-center sm:pt-[5.75rem]"
                >
                    <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-10 sm:gap-12 translate-y-[var(--hero-diamond-nudge)]">
                        <img
                            src={headshot}
                            alt="Georgia Martinez"
                            className="size-36 rounded-full object-cover shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/45 ring-offset-1 ring-offset-transparent sm:size-44"
                        />

                        <div className="max-w-xl space-y-2 sm:space-y-3">
                            <h1 className="text-gradient-ion text-balance font-heading text-3xl font-semibold tracking-tight sm:text-4xl md:text-5xl">
                                Georgia Martinez
                            </h1>
                            <p className="text-pretty text-xl text-zinc-300 sm:text-2xl">
                                Full Stack Software Engineer
                            </p>
                        </div>

                        <div className="flex items-center gap-5">
                            <a
                                href={RESUME_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={HERO_RESUME_LINK}
                            >
                                Resume
                            </a>
                            <a
                                href={LINKEDIN_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={HERO_SOCIAL_ICON_LINK}
                                aria-label="Georgia Martinez on LinkedIn"
                            >
                                <LinkedInIcon className="size-7 origin-center scale-[0.82]" />
                            </a>
                            <a
                                href={GITHUB_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={HERO_SOCIAL_ICON_LINK}
                                aria-label="Georgia Martinez on GitHub"
                            >
                                <GitHubIcon className="size-7 origin-center scale-[1.1]" />
                            </a>
                        </div>
                    </div>
                </section>

                <section id="about" className={`scroll-mt-20 ${SECTION_SHELL}`}>
                    <div className={SECTION_INNER}>
                        <h2 className="font-heading text-2xl font-semibold tracking-tight text-section-gold sm:text-3xl">
                            Howdy! 👋🏼
                        </h2>
                        <div className="mt-6 space-y-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
                            <p>
                                My name is Georgia and I have over two years of
                                experience in software development.
                            </p>
                            <p>
                                I'm currently working as a Software Developer &
                                Consultant at{" "}
                                <a
                                    href="https://atomicobject.com/"
                                    className="font-medium text-ion-400 underline decoration-ion-400/40 decoration-2 underline-offset-4 transition-colors hover:text-coral"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    Atomic Object
                                </a>
                                , a software consultancy based in Michigan that
                                builds high-quality custom software for our
                                clients.
                            </p>
                            <p>
                                I graduated with a B.S. in Computer Science from
                                Case Western Reserve University in 2024.
                            </p>
                            <p>
                                Outside of work, you'll find me jamming on keys
                                in my cover band, playing euphonium in concert
                                band, going for a run around the neighborhood,
                                or burried in a good book.
                            </p>
                        </div>
                    </div>
                </section>

                <section
                    id="projects"
                    className={`scroll-mt-20 ${SECTION_SHELL} mt-12 mb-16 sm:mt-16 sm:mb-20`}
                    aria-labelledby="projects-heading"
                >
                    <div className={SECTION_INNER}>
                        <h2
                            id="projects-heading"
                            className="font-heading text-2xl font-semibold tracking-tight text-section-gold sm:text-3xl"
                        >
                            Projects 👩🏻‍💻
                        </h2>
                        <p className="mt-4 text-base leading-relaxed text-zinc-300 sm:text-lg">
                            I love building cool software. Check out my awesome
                            projects below!
                        </p>
                        <ul className="mt-8 grid list-none gap-6 p-0 sm:gap-8">
                            {PROJECTS.map((project) => {
                                const ytPreviewId = project.video
                                    ? youtubeVideoIdFromUrl(project.video)
                                    : null;
                                return (
                                    <li
                                        key={project.title}
                                        className="border border-white/10 bg-space-card/90 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.35)] sm:p-8"
                                    >
                                        <div
                                            className={
                                                project.image || project.video
                                                    ? "flex flex-col gap-6 sm:flex-row sm:items-stretch sm:gap-8"
                                                    : undefined
                                            }
                                        >
                                            {project.image || project.video ? (
                                                <div className="flex min-h-0 shrink-0 flex-col self-stretch sm:w-52 md:w-60">
                                                    <div className="shrink-0">
                                                        {project.video ? (
                                                            <button
                                                                type="button"
                                                                className="group relative w-full overflow-hidden border border-white/12"
                                                                onClick={() => {
                                                                    if (
                                                                        ytPreviewId
                                                                    ) {
                                                                        setOpenVideo(
                                                                            {
                                                                                kind: "youtube",
                                                                                videoId:
                                                                                    ytPreviewId,
                                                                            }
                                                                        );
                                                                    } else {
                                                                        setOpenVideo(
                                                                            {
                                                                                kind: "file",
                                                                                src: project.video!,
                                                                            }
                                                                        );
                                                                    }
                                                                }}
                                                                aria-label="Play demo video"
                                                            >
                                                                {ytPreviewId ? (
                                                                    <img
                                                                        src={`https://i.ytimg.com/vi/${ytPreviewId}/hqdefault.jpg`}
                                                                        alt=""
                                                                        className="pointer-events-none aspect-video w-full object-cover"
                                                                    />
                                                                ) : (
                                                                    <video
                                                                        src={
                                                                            project.video
                                                                        }
                                                                        className="pointer-events-none aspect-video w-full object-cover"
                                                                        muted
                                                                        playsInline
                                                                        preload="metadata"
                                                                    />
                                                                )}
                                                                <span
                                                                    className="absolute inset-0 flex items-center justify-center bg-black/45 transition-colors group-hover:bg-black/55"
                                                                    aria-hidden
                                                                >
                                                                    <span className="flex size-16 items-center justify-center rounded-full bg-white/92 text-space-void shadow-lg transition-transform group-hover:scale-105 group-hover:bg-white">
                                                                        <PlayIcon className="size-7 translate-x-0.5" />
                                                                    </span>
                                                                </span>
                                                            </button>
                                                        ) : (
                                                            <img
                                                                src={
                                                                    project.image
                                                                }
                                                                alt={
                                                                    project.imageAlt ??
                                                                    ""
                                                                }
                                                                className="w-full border border-white/10 object-cover object-left"
                                                            />
                                                        )}
                                                    </div>
                                                    {project.href ||
                                                    project.hrefSecondary ? (
                                                        <>
                                                            <div
                                                                className="hidden min-h-0 flex-1 sm:block"
                                                                aria-hidden
                                                            />
                                                            <div className="shrink-0">
                                                                <ProjectCtaGroup
                                                                    href={
                                                                        project.href
                                                                    }
                                                                    hrefLabel={
                                                                        project.hrefLabel
                                                                    }
                                                                    hrefSecondary={
                                                                        project.hrefSecondary
                                                                    }
                                                                    hrefSecondaryLabel={
                                                                        project.hrefSecondaryLabel
                                                                    }
                                                                    className={
                                                                        projectCtaClassMedia
                                                                    }
                                                                />
                                                            </div>
                                                        </>
                                                    ) : null}
                                                </div>
                                            ) : null}
                                            <div className="min-w-0 flex-1">
                                                <h3 className="font-heading text-lg font-semibold text-zinc-100 sm:text-xl">
                                                    {project.title}
                                                </h3>
                                                {project.meta ? (
                                                    <p className="mt-1 text-sm text-zinc-400 sm:text-base">
                                                        {project.meta}
                                                    </p>
                                                ) : null}
                                                <p className="mt-3 text-base leading-relaxed text-zinc-300 sm:text-lg">
                                                    {project.description}
                                                </p>
                                                {project.skills &&
                                                project.skills.length > 0 ? (
                                                    <div className="mt-4">
                                                        <p className="text-xs font-medium tracking-wide text-zinc-500 uppercase">
                                                            Skills
                                                        </p>
                                                        <ul className="mt-2 flex list-none flex-wrap gap-2 p-0">
                                                            {project.skills.map(
                                                                (skill) => (
                                                                    <li
                                                                        key={
                                                                            skill
                                                                        }
                                                                    >
                                                                        <span className="inline-block border border-white/12 bg-white/5 px-2.5 py-1 text-sm text-zinc-300">
                                                                            {
                                                                                skill
                                                                            }
                                                                        </span>
                                                                    </li>
                                                                )
                                                            )}
                                                        </ul>
                                                    </div>
                                                ) : null}
                                                {(project.href ||
                                                    project.hrefSecondary) &&
                                                !project.image &&
                                                !project.video ? (
                                                    <div className="mt-4">
                                                        <ProjectCtaGroup
                                                            href={project.href}
                                                            hrefLabel={
                                                                project.hrefLabel
                                                            }
                                                            hrefSecondary={
                                                                project.hrefSecondary
                                                            }
                                                            hrefSecondaryLabel={
                                                                project.hrefSecondaryLabel
                                                            }
                                                            className={
                                                                projectCtaClassFallback
                                                            }
                                                        />
                                                    </div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>
                </section>
            </main>
        </>
    );
}

export default App;
