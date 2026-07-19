import { motion, useReducedMotion } from 'framer-motion';
import heroImage from '../assets/images/hero.png';

const EASE = [0.16, 1, 0.3, 1];

function Hero() {
  const reduceMotion = useReducedMotion();

  const container = {
    hidden: {},
    show: { transition: reduceMotion ? {} : { staggerChildren: 0.12, delayChildren: 0.3 } },
  };

  const layer = reduceMotion
    ? {}
    : {
        hidden: { opacity: 0, y: 24 },
        show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
      };

  return (
    <section id="top" className="bg-[#F2F0E9]">
      <div className="relative mx-auto flex min-h-[760px] max-w-[1440px] overflow-hidden bg-gradient-to-br from-white via-[#F8F7F2] to-[#ECE9DF] shadow-[0_30px_80px_rgba(0,0,0,.08)]">

        {/* Layer-line texture — signature detail */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              'repeating-linear-gradient(180deg, #141311 0px, #141311 1px, transparent 1px, transparent 10px)',
          }}
        />

        <img
          src={heroImage}
          alt="CraftXYZ Hero"
          className="absolute inset-0 h-full w-full select-none object-cover object-right"
          draggable="false"
        />
        <div className="absolute inset-0 bg-white/10 backdrop-[1px]" />

        <div className="relative z-10 flex w-full items-center">
          <div className="mx-auto flex w-full max-w-[1250px] px-8 md:px-16">
            <motion.div variants={container} initial="hidden" animate="show" className="max-w-xl">
              <motion.div
                variants={layer}
                className="inline-flex items-center gap-2 rounded-full border border-[#141311]/10 bg-white/85 px-4 py-2 shadow-md backdrop-blur-lg"
              >
                <span className="h-2.5 w-2.5 rounded-full bg-[#8BCF2F] shadow-[0_0_14px_rgba(139,207,47,.85)]" />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-[#141311]/70">
                  Premium 3D Printed Products
                </span>
              </motion.div>

              <motion.h1
                variants={layer}
                className="mt-8 font-['Space_Grotesk'] text-[clamp(3.5rem,7vw,6.5rem)] font-bold leading-[0.88] tracking-[-0.04em] text-[#141311]"
              >
                Crafted for
                <br />
                <span className="text-[#6F9E23]">Modern Living.</span>
              </motion.h1>

              <motion.p variants={layer} className="mt-8 max-w-lg text-lg leading-8 text-[#141311]/60">
                Beautifully designed 3D printed creations, built layer by layer
                with precision, creativity and premium materials.
              </motion.p>

              <motion.div variants={layer} className="mt-10 flex flex-wrap gap-4">
                <a
                  href="#products"
                  className="rounded-full bg-[#141311] px-8 py-4 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#6F9E23]"
                >
                  Shop Collection
                </a>
                <a
                  href="#categories"
                  className="rounded-full border border-[#141311]/15 bg-white/90 px-8 py-4 text-sm font-semibold text-[#141311] transition-all duration-300 hover:border-[#141311]"
                >
                  Explore Designs
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Build sheet — replaces the generic floating card */}
        <motion.div
          variants={layer}
          initial={reduceMotion ? undefined : 'hidden'}
          animate={reduceMotion ? undefined : 'show'}
          transition={reduceMotion ? undefined : { delay: 0.7 }}
          className="absolute bottom-8 right-8 hidden w-64 rounded-2xl border border-white/70 bg-white/85 p-5 shadow-2xl backdrop-blur-xl lg:block"
        >
          <div className="flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-[#141311]/50">
            <span>Build sheet</span>
            <span className="text-[#6F9E23]">●&nbsp;Complete</span>
          </div>
          <div className="mt-3 space-y-1.5 font-mono text-[11px] text-[#141311]/70">
            <div className="flex justify-between"><span>Material</span><span className="text-[#141311]">PLA+</span></div>
            <div className="flex justify-between"><span>Layer height</span><span className="text-[#141311]">0.12mm</span></div>
            <div className="flex justify-between"><span>Finish</span><span className="text-[#141311]">Hand-sanded</span></div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default Hero;