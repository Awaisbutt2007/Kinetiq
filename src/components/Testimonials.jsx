import { SplitText, Reveal } from './Motion'

const quotes = [
  { q: 'The sublimation is unreal — after a full season the colours look brand new.', a: 'Daniyal R.', r: 'Captain, Lahore Strikers FC' },
  { q: 'Design to delivery in under two weeks. Every player got their name spelled right.', a: 'Sara K.', r: 'Manager, Northside Ladies' },
  { q: 'The training trousers are the first thing our squad grabs on cold mornings.', a: 'Coach Imran', r: 'City Academy U18' },
  { q: 'They turned a rough crest sketch into the cleanest kit in our league.', a: 'Hamza T.', r: 'Founder, Royal Eleven' },
  { q: 'Fit, fabric and finish all feel pro-level at a club-level price.', a: 'Ali M.', r: 'Chairman, Westend United' },
]

export default function Testimonials() {
  const all = [...quotes, ...quotes]
  return (
    <section className="section testimonials">
      <div className="section-head">
        <Reveal><p className="eyebrow">05 — Squad Talk</p></Reveal>
        <h2 className="h2"><SplitText text="Trusted on" /> <SplitText text="every pitch" className="accent" delay={0.15} /></h2>
      </div>
      <div className="t-track-wrap">
        <div className="t-track">
          {all.map((x, i) => (
            <figure className="t-card" key={i}>
              <div className="t-stars">★★★★★</div>
              <blockquote>“{x.q}”</blockquote>
              <figcaption><b>{x.a}</b><span>{x.r}</span></figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
