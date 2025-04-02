async function convertCurrency() {
  const amount = parseFloat(document.getElementById("amount").value);
  const fromCurrency = document.getElementById("fromCurrency").value;
  const toCurrency = document.getElementById("toCurrency").value;
  const resultDiv = document.getElementById("result");
  const apiKey = "1a1a535d617bd52793da29f1"; // Substitua por uma chave válida

  if (isNaN(amount) || amount <= 0) {
    resultDiv.innerHTML = "⚠️ Por favor, insira um valor válido.";
    return;
  }

  try {
    let rate;

    if (fromCurrency === "BTC" || toCurrency === "BTC") {
      // Se uma das moedas for Bitcoin, buscar preço em USD primeiro
      const btcResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      const btcData = await btcResponse.json();
      const btcToUsd = btcData.bitcoin.usd;

      if (fromCurrency === "BTC") {
        // Converter BTC para USD, depois para a moeda de destino
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
        );
        const data = await response.json();
        rate = data.conversion_rates[toCurrency] / btcToUsd;
      } else {
        // Converter de moeda para USD, depois para BTC
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`
        );
        const data = await response.json();
        const usdRate = data.conversion_rates["USD"];
        rate = usdRate / btcToUsd;
      }
    } else {
      // Conversão entre moedas normais
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`
      );
      const data = await response.json();

      if (data.result !== "success") {
        resultDiv.innerHTML = "❌ Erro ao obter taxas de câmbio.";
        return;
      }
      rate = data.conversion_rates[toCurrency];
    }

    if (!rate) {
      resultDiv.innerHTML = `⚠️ Conversão para ${toCurrency} não disponível.`;
      return;
    }

    // Ajusta o número de casas decimais para BTC
    const convertedAmount = (amount * rate).toFixed(toCurrency === "BTC" ? 8 : 2);

    // Símbolos das moedas
    const symbols = {
      EUR: "€",
      BRL: "R$",
      CNY: "¥",
      ARS: "$",
      GBP: "£",
      USD: "$",
      BTC: "₿",
    };

    resultDiv.innerHTML = `<strong>${amount} ${symbols[fromCurrency]}</strong> = <strong>${convertedAmount} ${symbols[toCurrency]}</strong>`;
  } catch (error) {
    resultDiv.innerHTML = "⚠️ Erro ao conectar à API. Tente novamente mais tarde.";
    console.error("Erro:", error);
  }
}

// conversão ao pressionar Enter
document.getElementById("amount").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    convertCurrency();
  }
});
