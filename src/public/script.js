

async function getValue(key) {

  const select = document.getElementById(key);

  const route = window.location.href;

  const deps = select.getAttribute('data-deps');

  const filled = [];


  if (deps.length) {
    deps.split(',').forEach(item => {
      validateFilled(item, filled)
    })
  } else {
    Array.from(document.getElementById('fields').children).forEach(item => {
      if (item.children[1].value) {

        filled.push(item.children[1].getAttribute('data-key'))
      }
    })
  }


  if (!filled.includes(key)) {
    filled.push(key)
  }

  if (!select.value) {
    removeAll(key);
    return;
  }


  const values = filled.map(key => document.getElementById(key).value);

  fetch(route, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      filled: filled,
      values: values
    })
  })
    .then(result => result.json())
    .then(result => {

      result.forEach(item => {
        const select = document.getElementById(item.key);
        select.disabled = false;

        if (select.options.length <= 1) {
          item.value.forEach(v => {
            if (v.label) {
              select.add(new Option(v.label, v.value));
            } else {
              const [value] = Object.values(v);
              select.add(new Option(value, value));
            }
          })
        }
      });

      enabledButton();


    });
}

function enabledButton() {


  [...document.getElementsByTagName('button')].forEach(btn => {

    let enabled = true;


    btn.getAttribute('data-deps').split(',').forEach(item => {
      [...document.querySelectorAll(`[data-key=${item}]`)].forEach(x => {
        if (!x.value) {
          enabled = false
        }
      })
    })
    btn.disabled = enabled ? false : 'disabled';
  })
}


function removeAll(key) {

  [...document.getElementById('fields').children].forEach(item => {

    if (item.children[1].getAttribute('data-deps').includes(key)) {

      while (item.children[1].options?.length > 1) {
        item.children[1].remove(1);
      }
      item.children[1].disabled = true;
    }
  });

  [...document.getElementsByTagName('button')].forEach(btn => {
    if (btn.getAttribute('data-deps').includes(key)) {
      btn.disabled = 'disabled';
    }
  })

}

function validateFilled(key, filled) {
  const value = document.getElementById(key).value;

  if (value) {

    if (!filled.includes(key)) {
      filled.push(key)
    }

    const deps = document.getElementById(key).getAttribute('data-deps');

    if (deps.length) {
      deps.split(',').forEach(item => {
        validateFilled(item, filled)
      })
    } else {
      return filled
    }
  }

  return filled

}
