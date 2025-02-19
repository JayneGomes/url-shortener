const button = document.querySelector(".button");
const token = document.querySelector("#token-input");
const url = document.querySelector("#url-input");
const source = document.querySelector("#source-input");
const linksList = document.querySelector(".links");

const accentRemover = (str) =>
  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

const shortenLink = async () => {
  const tokenValue = token.value.trim();
  const urlValue = url.value.trim();
  const mediumInput = document.querySelector("#medium-input").value.trim();
  const medium = accentRemover(mediumInput.toLowerCase().replace(/\s+/g, "-"));
  const sourceValues = source.value
    .split(",")
    .map((o) => accentRemover(o.trim().toLowerCase()).replace(/\s+/g, "-"))
    .filter((o) => o);

  let links = [];
  let errors = [];
  linksList.innerHTML = "";

  if (!urlValue || sourceValues.length === 0 || !tokenValue || !medium) {
    linksList.innerHTML += "❌ Preencha todos os campos!";
    return;
  }

  for (let source of sourceValues) {
    let urlWithUtm = `${urlValue}?utm_source=${source}&utm_medium=${medium}`;
    let linkTitle = `${urlValue} ${source}`;

    try {
      const response = await fetch("https://api-ssl.bitly.com/v4/shorten", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenValue}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          long_url: urlWithUtm,
          domain: "bit.ly",
          title: linkTitle,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        links.push(
          `<a href="${data.link}" target="_blank">${data.link}</a> (${source})`
        );
      } else {
        errors.push(`❌ Erro ao encurtar: ${urlWithUtm}`);
      }
    } catch (error) {
      errors.push(`❌ Erro na requisição para: ${urlWithUtm}`);
    }
  }
  linksList.innerHTML =
    links.length > 0 ? links.join("<br>") : "Nenhum link foi gerado.";

  if (errors.length > 0) {
    linksList.innerHTML += "<br>" + errors.join("<br>");
  }
};

button.addEventListener("click", () => {
  shortenLink();
});
