    if (options) {
      options.forEach((option) => {
        // const cartItemToAdjust = item.meta.categoryItems?
        const optionsDiv = document.createElement("div");
        optionsDiv.classList = "flex-row align option";
        const cartData = cartItem.options["id" + option.id];
        if (!option.toggle) {
          optionsDiv.innerHTML += `
            <div class="option-title">${option.title}, ${option.price}kr</div>
            <div class="option-adder flex-row align"></div>`;

          numberAdjuster({
            place: optionsDiv.querySelector(".option-adder"),
            startValue: cartData || 0,
            maxValue: option.stock,
            minusAction: () => {
              if (cartItem.options["id" + option.id]) {
                cartItem.options["id" + option.id]--;
              } else {
                cartItem.options["id" + option.id] = 0;
              }
            },
            plussAction: () => {
              if (cartItem.options["id" + option.id]) {
                cartItem.options["id" + option.id]++;
              } else {
                cartItem.options["id" + option.id] = 1;
              }
            },
            endAction: async () => {
              mainHandler.refresh();
            },
          });
        } else {
          optionsDiv.innerHTML = `
               <div class="option-title">${option.title}?${
            option.regular_price ? ` ${option.regular_price} kr` : ""
          }</div>
              <div class="option-changer flex-row align"></div>`;
          const cartData = cartItem.options["id" + option.id];

          toggleAdjuster({
            place: optionsDiv.querySelector(".option-changer"),
            startValue: cartData ? "yes" : option.toggle,
            noAction: () => {
              cartItem.options["id" + option.id] = 0;
            },
            yesAction: () => {
              cartItem.options["id" + option.id] = 1;
            },
            endAction: async () => {
              mainHandler.refresh();
            },
          });
        }

        optionContainer.appendChild(optionsDiv);
      });
    }