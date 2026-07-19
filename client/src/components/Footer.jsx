import { FiInstagram, FiMail } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="relative bg-[#141311] px-5 py-12 text-white sm:py-16" id="contact">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, #fff 0, #fff 6px, transparent 6px, transparent 11px)',
        }}
      />

      <div className="mx-auto grid w-[min(1320px,100%)] gap-12 sm:grid-cols-[1.3fr_1fr_1fr_1fr]">
        {/* Brand */}
        <div>
          <p className="font-['Space_Grotesk'] text-2xl font-bold tracking-[-.06em]">
            CRAFT<span className="text-[#B4FF39]">XYZ</span>
          </p>
          <p className="mt-5 max-w-xs text-sm leading-6 text-white/55">
            Playful, lasting objects printed one layer at a time in our
            independent studio.
          </p>
          <div className="mt-6 flex gap-3">
            <a
              className="grid size-10 place-items-center rounded-full border border-white/15 text-white transition hover:border-[#B4FF39] hover:bg-[#B4FF39] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B4FF39]"
              href="https://www.instagram.com/mr__mrs_jatav/"
              target="_blank"
              rel="noreferrer"
              aria-label="Follow CraftXYZ on Instagram"
            >
              <FiInstagram size={18} />
            </a>
            <a
              className="grid size-10 place-items-center rounded-full border border-white/15 text-white transition hover:border-[#B4FF39] hover:bg-[#B4FF39] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B4FF39]"
              href="mailto:pankajkumar879517@gmail.com"
              aria-label="Email CraftXYZ"
            >
              <FiMail size={18} />
            </a>
            <a
              className="grid size-10 place-items-center rounded-full border border-white/15 text-white transition hover:border-[#25D366] hover:bg-[#25D366] hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366]"
              href="https://wa.me/919219427841"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Chat on WhatsApp"
            >
              <FaWhatsapp size={18} />
            </a>
          </div>
        </div>

        {/* Explore */}
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#B4FF39]">
            Explore
          </p>
          <div className="mt-4 grid gap-2 text-sm text-white/65">
            <Link className="transition-colors hover:text-white" to="/products">Shop all</Link>
            <a className="transition-colors hover:text-white" href="/#categories">Collections</a>
            <a className="transition-colors hover:text-white" href="/#about">Our studio</a>
          </div>
        </div>

        {/* Policies */}
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#B4FF39]">
            Policies
          </p>
          <div className="mt-4 grid gap-2 text-sm text-white/65">
            <Link className="transition-colors hover:text-white" to="/policies/shipping">Shipping policy</Link>
            <Link className="transition-colors hover:text-white" to="/policies/returns">Returns & refunds</Link>
            <Link className="transition-colors hover:text-white" to="/policies/terms">Terms & conditions</Link>
          </div>
        </div>

        {/* Contact */}
        <div>
          <p className="font-mono text-[10px] font-bold uppercase tracking-[.18em] text-[#B4FF39]">
            Contact
          </p>
          <div className="mt-4 grid gap-3 text-sm text-white/65">
            <a className="inline-flex items-center gap-2 transition-colors hover:text-white" href="mailto:pankajkumar879517@gmail.com">
              <FiMail aria-hidden="true" size={24} />
         
            </a>
            <a
              className="inline-flex items-center gap-2 transition-colors hover:text-white"
              href="https://www.instagram.com/mr__mrs_jatav/"
              target="_blank"
              rel="noreferrer"
            >
              <FiInstagram aria-hidden="true" size={24} />
              
            </a>
            <a
              className="inline-flex items-center gap-2 transition-colors hover:text-[#25D366]"
              href="https://wa.me/919219427841"
              target="_blank"
              rel="noopener noreferrer"
            >
              <FaWhatsapp aria-hidden="true" size={24} />
             
            </a>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-14 flex w-[min(1320px,100%)] flex-col gap-2 border-t border-white/10 pt-5 text-[11px] text-white/35 sm:flex-row sm:justify-between">
        <span>© 2026 CraftXYZ</span>
        <span>Designed to stand out.</span>
      </div>
    </footer>
  );
}

export default Footer;