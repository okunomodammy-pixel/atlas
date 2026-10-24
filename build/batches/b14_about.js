function aboutPanel() {
  const n = Object.values(D.facts).filter(f => f.un || f.obs).length, qs = QB.length, passed = COURSE.filter(([id]) => saved.mastered[id]).length;
  setPanel(`<div class="eyebrow">About</div><h2>A world you can carry in your head</h2>
  <p>Most of us were taught geography as lists: capitals, rivers, a map with Africa drawn too small. The news then talks about Hormuz, the Sahel, BRICS or the naira as if we already knew where and why. This atlas closes that gap. It is built to leave you with a map of the world you can see with your eyes closed, and the habit of asking what a place means today.</p>

  <h3>What you gain</h3>
  <ul>
  <li><b>You can place any country</b> and say what surrounds it. Every one of the ${n} countries has a profile: its neighbours, its people, how its borders were made, why its location matters, and a line to help you remember it.</li>
  <li><b>You read maps critically.</b> You will know why Africa looks small on most maps, why the shortest flight looks curved, and when a "natural" border is really a political choice.</li>
  <li><b>You understand Nigeria from the inside.</b> From Nok and the old kingdoms to 1914, the civil war, June 12 and the Fourth Republic, with the national question argued from several sides.</li>
  <li><b>You can follow the news with a map in mind.</b> Wars, chokepoints, blocs, currencies and the minerals the world now fights over, checked against sources dated 2026.</li>
  <li><b>You think in more than one frame.</b> Lessons separate facts from interpretation and set rival views side by side (realist and liberal, geography and institutions, Soyinka and Achebe), so you form your own judgement.</li>
  <li><b>You remember it.</b> Each lesson ends with a short check, and a daily review brings back what you missed at growing intervals, the method memory research supports best.</li></ul>

  <h3>How to use it, ten minutes a day</h3>
  <ol><li><b>Clear your daily review</b> if one is waiting (on the home page). Two or three minutes.</li>
  <li><b>Read one part of a lesson</b> under Learn, with the map beside it. Pass its check when you finish the lesson.</li>
  <li><b>Take one walk</b> in Explore: open a country you have never visited and step across its borders, or switch on a Today's world layer from the Map button.</li></ol>
  <p>You have passed ${passed} of ${COURSE.length} lesson checks, and the review bank holds ${qs} questions. Your progress stays in this browser only; nothing is sent anywhere.</p>

  <h3>Who it is for</h3>
  <p>Curious readers who want truth over half-truths; students of geography, history, economics and International Relations (the lessons cover Westphalia, geopolitics, non-alignment, Nigerian foreign policy and the CFA debate); teachers who want a map that changes as they talk; travellers who want context before they go.</p>

  <h3>How to read what it tells you</h3>
  <p>Labels mark the difference between a fact, an <span class="kind">Interpretation</span> and something <span class="kind">Debated</span>. Fast-changing facts carry a date: memberships were checked in October 2026, population comes from the UN's 2024 projections for mid-2026, and Nigeria has not held a census since 2006. If a fact looks wrong to you, it may have changed; check the date, then the source.</p>

  <h3>Where the facts come from</h3>
  <ul>
  <li><b>Maps:</b> Natural Earth (public domain) for borders, rivers, seas, landforms, cities, time zones and ocean depths; historical borders from André Ourednik's historical-basemaps (GPL-3.0).</li>
  <li><b>Country facts:</b> the world-countries dataset (capitals, borders, area, languages, currencies, corrected for changes to 2026).</li>
  <li><b>People:</b> United Nations, World Population Prospects 2024.</li>
  <li><b>Today's world layers:</b> the list of ongoing armed conflicts as compiled in October 2026 (built on UCDP and ACLED data), and the US Geological Survey's Mineral Commodity Summaries 2026.</li>
  <li><b>Lessons</b> are written for this atlas, using as guides Blainey's <i>A Very Short History of the World</i>, Ghosh's <i>International Relations</i>, Falola and Heaton's <i>A History of Nigeria</i> and Soyinka's <i>The Open Sore of a Continent</i>, updated with newer research and news to October 2026. Slave-trade figures: the SlaveVoyages database. Nigerian economic figures: CBN and NBS as reported.</li></ul>
  <p class="src">Counting convention: 193 UN members plus 2 observer states (Vatican City and Palestine). Taiwan, Kosovo, Western Sahara, Somaliland and Northern Cyprus are shown with notes on their status. Some boundaries are drawn as controlled on the ground, which is not a judgement on any claim.</p>

  <h3>What is coming, in order of usefulness</h3>
  <ol><li><b>Current economic figures for every country</b> (GDP, income per person, inflation, debt), from the IMF World Economic Outlook.</li>
  <li><b>More of today's world:</b> energy (oil, gas and power), trade partners, migration and refugees.</li>
  <li><b>Climate risk:</b> who is most exposed to drought, flooding and heat, and why that shapes migration and conflict.</li>
  <li>Lesson checks extended into the games, and teacher-friendly printouts.</li></ol>
  <p class="src">Flags use your device's emoji; some Windows computers show letters instead. Built in October 2026.</p>`); }
