import { Link } from 'react-router-dom';

function NotFound() { return <main className="grid min-h-[60vh] place-items-center px-5 text-center"><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#6f9e23]">404 — Not found</p><h1 className="mt-4 text-5xl font-semibold tracking-[-.07em] sm:text-7xl">Wrong turn. Good taste.</h1><p className="mx-auto mt-5 max-w-sm text-sm leading-6 text-[#6b6b63]">The page you were looking for is not part of this collection.</p><Link className="mt-8 inline-block rounded-full bg-black px-6 py-3.5 text-sm font-bold text-[#b4ff39]" to="/">Back home</Link></div></main>; }

export default NotFound;
