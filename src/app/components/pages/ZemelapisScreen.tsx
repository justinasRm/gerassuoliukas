export const ZemelapisScreen = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[hsl(125,100%,5%)] text-white">
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="flex flex-col items-center gap-2">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Žemė<span className="text-[hsl(118,100%,70%)]">lapis</span>
          </h1>
          <p className="text-2xl text-white/70">
            Raskite geriausius suoliukus jūsų mieste
          </p>
        </div>

        <div className="flex flex-col items-center justify-center gap-8">
          <div className="grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 transition hover:bg-white/20">
              <h3 className="text-2xl font-bold text-[hsl(118,100%,70%)]">
                Paieška
              </h3>
              <p className="text-base text-white/80">
                Ieškokite suoliukų pagal vietovę, reitingą ar atstumo nuo jūsų.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 transition hover:bg-white/20">
              <h3 className="text-2xl font-bold text-[hsl(118,100%,70%)]">
                Vertinimas
              </h3>
              <p className="text-base text-white/80">
                Vertinkite suoliukus ir dalinkitės savo patirtimi su
                bendruomene.
              </p>
            </div>

            <div className="flex flex-col gap-4 rounded-xl bg-white/10 p-6 transition hover:bg-white/20">
              <h3 className="text-2xl font-bold text-[hsl(118,100%,70%)]">
                Žemėlapis
              </h3>
              <p className="text-base text-white/80">
                Interaktyvus žemėlapis su visais suoliukais jūsų regione.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <button className="rounded-full bg-[hsl(118,100%,70%)] px-8 py-3 font-semibold text-black no-underline transition hover:bg-[hsl(118,80%,60%)]">
              Pradėti paiešką
            </button>
            <button className="rounded-full bg-white/10 px-8 py-3 font-semibold no-underline transition hover:bg-white/20">
              Žiūrėti žemėlapį
            </button>
          </div>
        </div>

        <div className="mt-8 max-w-2xl text-center">
          <p className="text-sm text-white/60">
            GerasSuoliukas - bendruomenės valdoma platforma, skirta rasti ir
            vertinti geriausius suoliukus. Prisijunkite prie tūkstančių žmonių,
            kurie dalijasi savo patirtimi.
          </p>
        </div>
      </div>
    </main>
  );
};
