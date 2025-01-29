function Footer() {
    const currentYear = new Date().getFullYear()

    const technologies = [
        { href: "https://python.org", src: "/python.svg", alt: "Python Logo" },
        { href: "https://react.dev", src: "/react.svg", alt: "React Logo" },
        { href: "https://tailwindcss.com", src: "/tailwind.svg", alt: "Tailwind CSS Logo" },
        { href: "https://github.com/deepseek-ai/DeepSeek-LLM", src: "/deepseek.svg", alt: "DeepSeek Logo" },
    ]

    return (
        <footer className="py-6 text-center text-muted-foreground tracking-tight">
            <p className="text-base md:text-lg mb-4 font-medium tracking-wide">
                {currentYear}{' | '}
                <a
                    href="https://github.com/joey-david/chatbrain"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-foreground transition-all text-slate-300"
                >
                    chatbrain 
                </a>
                {' '}is built with 
            </p>
            <p className="flex items-center justify-center gap-6 text-base md:text-lg leading-relaxed mx-auto max-w-2xl">
                {technologies.map(({ href, src, alt }) => (
                    <a
                        key={href}
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="transition-transform hover:scale-110"
                    >
                        <img
                            src={src}
                            alt={alt}
                            className="h-6 inline grayscale hover:grayscale-0 transition-all"
                        />
                    </a>
                ))}
            </p>
        </footer>
    )
}

export { Footer }
