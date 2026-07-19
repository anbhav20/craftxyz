import { Link, useParams } from 'react-router-dom';
import { policies } from '../data/policies';

function PolicyPage() {
  const { policyId } = useParams();
  const policy = policies[policyId];
  if (!policy) return <main className="grid min-h-[60vh] place-items-center px-5 text-center"><div><h1 className="text-5xl font-semibold tracking-[-.07em]">Policy not found.</h1><Link className="mt-7 inline-block rounded-full bg-black px-5 py-3 text-sm font-bold text-[#b4ff39]" to="/">Back home</Link></div></main>;
  return <main className="bg-white py-16 sm:py-24"><div className="mx-auto w-[min(900px,calc(100%-40px))]"><Link className="text-sm font-semibold text-[#6b6b63] hover:text-black" to="/">← Back home</Link><p className="mt-12 text-[10px] font-bold uppercase tracking-[.18em] text-[#6f9e23]">{policy.eyebrow}</p><h1 className="mt-4 max-w-3xl text-5xl font-semibold leading-[.9] tracking-[-.075em] sm:text-7xl">{policy.title}</h1><p className="mt-7 max-w-xl text-base leading-7 text-[#6b6b63]">{policy.intro}</p><div className="mt-14 grid gap-10">{policy.sections.map((section, index) => <section className="grid gap-3 border-t border-[#deded8] pt-5 sm:grid-cols-[180px_1fr]" key={section.heading}><p className="text-sm font-bold text-[#1c1c1a]">0{index + 1} — {section.heading}</p><p className="max-w-xl text-sm leading-7 text-[#6b6b63]">{section.body}</p></section>)}</div><p className="mt-16 border-t border-[#deded8] pt-5 text-sm text-[#6b6b63]">Questions? <a className="font-bold text-black underline underline-offset-4" href="mailto:pankajkumar879517@gmail.com">Email our studio</a>.</p></div></main>;
}

export default PolicyPage;
