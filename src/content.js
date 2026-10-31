/* Targeted editorial overlays apply after the base profiles, before the app opens. */
const CONTENT_REVIEW={edition:"2026-10-31",profiles:["GHA","BEN","CMR"]};
Object.assign(PROFILES.GHA,{
  people:"English is the official language, alongside widely spoken Ghanaian languages including Akan, Ewe and Ga. An official-language label is a starting point, not a description of every conversation or community. Accra is the capital; coastal cities, inland towns and northern communities belong to the same national picture.",
  memo:"Ghana: Gulf of Guinea coast below the large Lake Volta, between Côte d’Ivoire and Togo. Follow the coast east through Togo and Benin to reach Nigeria."
});
Object.assign(PROFILES.BEN,{
  people:"French is the official language; Fon, Yoruba and many other languages are used in daily life. Porto-Novo is the official capital, while Cotonou is the major coastal city and seat of government. Knowing both helps you read a map more carefully than memorising a single capital name.",
  memo:"Benin: Nigeria's narrow western neighbour, stretching inland from a short Gulf of Guinea coast. The modern Republic of Benin and the historic Kingdom of Benin, centred on Benin City in today's Nigeria, are different places."
});
Object.assign(PROFILES.CMR,{
  phys:"Nigeria's eastern neighbour, with an Atlantic coast, forested southern areas, highlands around Mount Cameroon and a drier north reaching towards Lake Chad. The border does not mark one uniform landscape: compare the coastal and highland settings on both sides.",
  memo:"Cameroon: east of Nigeria, rising inland from the Gulf of Guinea and stretching north towards Lake Chad. Use the coast, highlands and northern extension together to recognise its shape."
});
const originalProfileHTML=profileHTML;
profileHTML=function(f){return originalProfileHTML(f)+(CONTENT_REVIEW.profiles.includes(f.c3)?`<p class="editor-note">Editorial review ${CONTENT_REVIEW.edition}: regional anchors and everyday context. <button class="lnk" data-mode-go="about">Read the source notes</button></p>`:"");};
