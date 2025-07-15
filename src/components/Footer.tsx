export function Footer() {
  return (
    <footer className="relative z-10 w-full space-y-1 py-8 text-center text-sm text-gray-400">
      <div>
        <a
          href="/public/documents/Mohamed%20H.%20Aly.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-semibold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
        >
          Resume
        </a>
        <span className="mx-2">|</span>
        <a
          href="https://www.linkedin.com/in/mohamed-h-aly/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-semibold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
        >
          Linkedin
        </a>
        <span className="mx-2">|</span>
        <a
          href="https://github.com/metwesh"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block font-semibold text-cyan-400 transition-colors hover:text-cyan-300 hover:underline"
        >
          Github
        </a>
      </div>
      <p>
        <span>&copy;&nbsp;{new Date().getFullYear()}&nbsp;</span>
        <span className="text-cyan-400">Mohamed H. Aly</span>
        <span>&nbsp;All rights reserved.</span>
      </p>
    </footer>
  );
}
