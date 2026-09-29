(() => {
  'use strict';
  const display = document.getElementById('display');
  const expressionView = document.getElementById('expression');
  const previewView = document.getElementById('preview');
  const historyList = document.getElementById('history-list');
  const historyCount = document.getElementById('history-count');
  const themeToggle = document.getElementById('theme-toggle');
  let current = '0';
  let previous = null;
  let operator = null;
  let waitingForOperand = false;
  let completed = false;
  let memory = 0;
  let history = loadJSON('codealpha-calculator-history', []);

  function format(value) {
    if (!Number.isFinite(value)) return 'Invalid expression';
    if (Object.is(value, -0)) value = 0;
    const rounded = Number(value.toPrecision(12));
    return String(rounded);
  }
  function numericCurrent() { const n = Number(current); return Number.isFinite(n) ? n : 0; }
  function calculate(a, op, b) {
    if (op === '+') return a + b;
    if (op === '−') return a - b;
    if (op === '×') return a * b;
    if (op === '÷') return b === 0 ? null : a / b;
    return b;
  }
  function operationLabel(op) { return op; }
  function updateDisplay() {
    display.textContent = current;
    expressionView.textContent = previous !== null && operator ? `${format(previous)} ${operationLabel(operator)}` : '\u00a0';
    if (previous !== null && operator && !waitingForOperand) {
      const value = calculate(previous, operator, numericCurrent());
      previewView.textContent = value === null ? 'Cannot divide by zero' : `= ${format(value)}`;
    } else previewView.textContent = '\u00a0';
  }
  function inputNumber(number) {
    if (completed || current === 'Invalid expression' || current === 'Cannot divide by zero') { current = number; completed = false; previous = null; operator = null; }
    else if (waitingForOperand) { current = number; waitingForOperand = false; }
    else current = current === '0' ? number : current.length < 18 ? current + number : current;
    updateDisplay();
  }
  function chooseOperation(nextOperator) {
    if (current === 'Cannot divide by zero' || current === 'Invalid expression') clearCalculator();
    const input = numericCurrent();
    if (operator && !waitingForOperand) {
      const result = calculate(previous, operator, input);
      if (result === null || !Number.isFinite(result)) { showError('Cannot divide by zero'); return; }
      current = format(result); previous = result;
    } else if (previous === null || completed) previous = input;
    operator = nextOperator; waitingForOperand = true; completed = false; updateDisplay();
  }
  function compute() {
    if (!operator || previous === null || waitingForOperand) return;
    const a = previous, b = numericCurrent(), op = operator;
    const result = calculate(a, op, b);
    if (result === null) { showError('Cannot divide by zero'); return; }
    if (!Number.isFinite(result)) { showError('Invalid expression'); return; }
    const formatted = format(result);
    addHistory(`${format(a)} ${op} ${format(b)}`, formatted);
    expressionView.textContent = `${format(a)} ${op} ${format(b)} =`;
    current = formatted; previous = null; operator = null; waitingForOperand = true; completed = true;
    previewView.textContent = '\u00a0'; display.textContent = current;
  }
  function showError(message) {
    current = message; previous = null; operator = null; waitingForOperand = true; completed = true;
    expressionView.textContent = '\u00a0'; previewView.textContent = '\u00a0'; display.textContent = current;
  }
  function clearCalculator() { current = '0'; previous = null; operator = null; waitingForOperand = false; completed = false; updateDisplay(); }
  function deleteNumber() {
    if (completed || current.length <= 1 || (current.length === 2 && current.startsWith('-'))) current = '0';
    else current = current.slice(0, -1);
    completed = false; waitingForOperand = false; updateDisplay();
  }
  function toggleSign() {
    if (current === '0' || current.includes('Cannot') || current.includes('Invalid')) return;
    current = current.startsWith('-') ? current.slice(1) : `-${current}`; completed = false; updateDisplay();
  }
  function percentage() {
    if (current.includes('Cannot') || current.includes('Invalid')) return;
    current = format(numericCurrent() / 100); completed = false; updateDisplay();
  }
  function decimal() {
    if (completed || waitingForOperand) { current = '0.'; waitingForOperand = false; completed = false; }
    else if (!current.includes('.')) current += '.';
    updateDisplay();
  }
  function scientific(action) {
    const value = action === 'pi' ? Math.PI : numericCurrent();
    if ((action === 'sqrt' && value < 0) || (action === 'reciprocal' && value === 0)) {
      showError(action === 'sqrt' ? 'Invalid expression' : 'Cannot divide by zero'); return;
    }
    const result = action === 'square' ? value * value : action === 'sqrt' ? Math.sqrt(value) : action === 'reciprocal' ? 1 / value : value;
    if (!Number.isFinite(result)) { showError('Invalid expression'); return; }
    const labels = { square: `${format(value)}²`, sqrt: `√(${format(value)})`, reciprocal: `1 ÷ ${format(value)}`, pi: 'π' };
    current = format(result); previous = null; operator = null; waitingForOperand = false; completed = false;
    updateDisplay(); expressionView.textContent = labels[action]; previewView.textContent = '\u00a0';
  }
  async function copyResult() {
    if (current.includes('Cannot') || current.includes('Invalid')) return;
    const button = document.getElementById('copy-result');
    try {
      await navigator.clipboard.writeText(current);
      button.textContent = 'Copied';
      window.setTimeout(() => { button.textContent = 'Copy result'; }, 1400);
    } catch { button.textContent = 'Copy unavailable'; window.setTimeout(() => { button.textContent = 'Copy result'; }, 1400); }
  }
  function toggleScientific() {
    const panel = document.getElementById('scientific-panel');
    const expanded = panel.hidden;
    panel.hidden = !expanded;
    document.getElementById('scientific-toggle').setAttribute('aria-expanded', String(expanded));
    document.getElementById('mode-caption').textContent = expanded ? 'SCIENTIFIC MODE' : 'STANDARD MODE';
  }
  function loadJSON(key, fallback) { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } }
  function saveHistory() { try { localStorage.setItem('codealpha-calculator-history', JSON.stringify(history)); } catch {} }
  function addHistory(equation, result) {
    history.unshift({ equation, result, id: `${Date.now()}-${Math.random()}` }); history = history.slice(0, 30); saveHistory(); renderHistory();
  }
  function renderHistory() {
    historyCount.textContent = history.length ? `${history.length} calculation${history.length === 1 ? '' : 's'}` : 'No calculations yet';
    if (!history.length) { historyList.innerHTML = '<div class="empty-history"><div class="empty-icon" aria-hidden="true">↗</div>Your calculations will appear here<br>once you get started.</div>'; return; }
    historyList.replaceChildren(...history.map(item => {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'history-item';
      button.setAttribute('aria-label', `Reuse ${item.equation} equals ${item.result}`);
      const equation = document.createElement('span'); equation.className = 'history-equation'; equation.textContent = `${item.equation} =`;
      const result = document.createElement('span'); result.className = 'history-result'; result.textContent = item.result;
      button.append(equation, result); button.addEventListener('click', () => { current = item.result; previous = null; operator = null; waitingForOperand = false; completed = false; expressionView.textContent = item.equation; updateDisplay(); });
      return button;
    }));
  }
  function clearHistory() { history = []; saveHistory(); renderHistory(); }
  function memoryClear() { memory = 0; document.getElementById('memory-indicator').textContent = ''; }
  function memoryRecall() { current = format(memory); previous = null; operator = null; waitingForOperand = false; completed = false; document.getElementById('memory-indicator').textContent = 'Memory recalled'; updateDisplay(); }
  function memoryAdd(direction) { memory += numericCurrent() * direction; document.getElementById('memory-indicator').textContent = 'M'; }
  function toggleTheme() { const dark = document.body.classList.toggle('dark'); try { localStorage.setItem('codealpha-calculator-theme', dark ? 'dark' : 'light'); } catch {} updateThemeButton(); }
  function updateThemeButton() { const dark = document.body.classList.contains('dark'); themeToggle.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`); }
  try { if (localStorage.getItem('codealpha-calculator-theme') === 'dark') document.body.classList.add('dark'); } catch {}
  updateThemeButton(); renderHistory(); updateDisplay();

  document.querySelector('.keypad').addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
    else if (button.dataset.operator) chooseOperation(button.dataset.operator);
    else ({ clear: clearCalculator, delete: deleteNumber, decimal, percent: percentage, sign: toggleSign, equals: compute })[button.dataset.action]?.();
  });
  document.querySelector('.memory-row').addEventListener('click', event => {
    const action = event.target.closest('[data-action]')?.dataset.action;
    ({ 'memory-clear': memoryClear, 'memory-recall': memoryRecall, 'memory-add': () => memoryAdd(1), 'memory-subtract': () => memoryAdd(-1) })[action]?.();
  });
  document.getElementById('clear-history').addEventListener('click', clearHistory);
  themeToggle.addEventListener('click', toggleTheme);
  document.getElementById('scientific-toggle').addEventListener('click', toggleScientific);
  document.getElementById('copy-result').addEventListener('click', copyResult);
  document.getElementById('scientific-panel').addEventListener('click', event => {
    const action = event.target.closest('[data-scientific]')?.dataset.scientific;
    if (action) scientific(action);
  });
  document.addEventListener('keydown', event => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (/^[0-9]$/.test(event.key)) { inputNumber(event.key); event.preventDefault(); }
    else if (event.key === '.') { decimal(); event.preventDefault(); }
    else if (event.key === '+') { chooseOperation('+'); event.preventDefault(); }
    else if (event.key === '-') { chooseOperation('−'); event.preventDefault(); }
    else if (event.key === '*') { chooseOperation('×'); event.preventDefault(); }
    else if (event.key === '/') { chooseOperation('÷'); event.preventDefault(); }
    else if (event.key === '%') { percentage(); event.preventDefault(); }
    else if (event.key === 'Enter' || event.key === '=') { compute(); event.preventDefault(); }
    else if (event.key === 'Backspace') { deleteNumber(); event.preventDefault(); }
    else if (event.key === 'Escape') { clearCalculator(); event.preventDefault(); }
  });
})();
