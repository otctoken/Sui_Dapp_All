const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function card(app) {
  return `<article class="app-card${app.featured ? ' featured' : ''}">
    ${app.featured ? '<div class="featured-label"><span aria-hidden="true">✦</span> chosen <span class="featured-line" aria-hidden="true"></span></div>' : ''}
    <div class="card-top"><div class="app-logo"><img src="${escape(app.logo)}" alt="${escape(app.name)} Logo" width="48" height="48" data-fallback="${escape(app.name.charAt(0))}"></div><div class="card-title"><h2>${escape(app.name)}</h2></div></div>
    <p class="card-description">${escape(app.description)}</p>
    <a class="card-link" href="${escape(app.url)}" target="_blank" rel="noopener noreferrer" aria-label="get ${escape(app.name)}，open"><span>Open the DApp</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 18 18 6M6 6h12v12"/></svg></a>
  </article>`;
}
