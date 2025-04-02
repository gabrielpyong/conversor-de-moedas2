async function convertCurrency() {
  const amount = parseFloat(document.getElementById("amount").value);
  const fromCurrency = document.getElementById("fromCurrency").value;
  const toCurrency = document.getElementById("toCurrency").value;
  const resultDiv = document.getElementById("result");
  const apiKey = "1a1a535d617bd52793da29f1"; // A chave API

  if (isNaN(amount) || amount <= 0) {
    resultDiv.innerHTML = "Por favor, insira um valor válido";
    return;
  }

  try {
    let rate;

    // Se envolver Bitcoin, usar a outra API que nao buga
    if (fromCurrency === "BTC" || toCurrency === "BTC") {
      // Pegar a taxa do Bitcoin em USD
      const btcResponse = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd"
      );
      const btcData = await btcResponse.json();
      const btcToUsd = btcData.bitcoin.usd;

      if (fromCurrency === "BTC" && toCurrency !== "BTC") {
        // Converter BTC para USD, depois USD para a moeda de destino
        const usdAmount = amount * btcToUsd;
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`
        );
        const data = await response.json();
        if (data.result !== "success") {
          resultDiv.innerHTML = "Erro ao obter taxas de câmbio: " + data.error_type;
          return;
        }
        rate = data.conversion_rates[toCurrency];
        rate = (1 / btcToUsd) * rate; // Ajustar a taxa
      } else if (toCurrency === "BTC" && fromCurrency !== "BTC") {
        // Converter a moeda de origem para USD, depois USD para BTC
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`
        );
        const data = await response.json();
        if (data.result !== "success") {
          resultDiv.innerHTML = "Erro ao obter taxas de câmbio: " + data.error_type;
          return;
        }
        const usdRate = data.conversion_rates["USD"];
        rate = usdRate / btcToUsd;
      }
    } else {
      // Para moedas fiduciárias
      const response = await fetch(
        `https://v6.exchangerate-api.com/v6/${apiKey}/latest/${fromCurrency}`
      );
      const data = await response.json();
      console.log("Resposta da API:", data);

      if (data.result !== "success") {
        resultDiv.innerHTML = "Erro ao obter taxas de câmbio: " + data.error_type;
        return;
      }
      rate = data.conversion_rates[toCurrency];
    }

    if (!rate) {
      resultDiv.innerHTML = `Taxa de câmbio para ${toCurrency} não disponível`;
      return;
    }

    const convertedAmount = (amount * rate).toFixed(8); // Mais casas decimais para BTC

    const symbols = {
      EUR: "€",
      BRL: "R$",
      CNY: "¥",
      ARS: "$",
      GBP: "£",
      USD: "$",
      BTC: "₿"
    };

    resultDiv.innerHTML = `${amount} ${symbols[fromCurrency]} = ${convertedAmount} ${symbols[toCurrency]}`;
  } catch (error) {
    resultDiv.innerHTML = "Erro de conexão com a API";
    console.error(error);
  }
}

//pra converter com Enter
document.getElementById("amount").addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    convertCurrency();
  }
});