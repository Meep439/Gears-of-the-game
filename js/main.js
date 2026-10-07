function encodeLevel(level) {
  return btoa(unescape(encodeURIComponent(JSON.stringify(level.toJSON()))));
}

function decodeLevel(code) {
  if (!code) return null;
  try {
    const json = decodeURIComponent(escape(atob(code)));
    return Level.fromJSON(JSON.parse(json));
  } catch (error) {
    return null;
  }
}

class App {
  constructor() {
    this.editor = null;
    this.game = null;
    this.level = new Level();
    this.initMainMenu();
    this.initGameUI();
    this.initEditorUI();
  }

  initMainMenu() {
    const mainMenu = document.getElementById('main-menu');
    const playMenu = document.getElementById('play-menu');
    const editorContainer = document.getElementById('editor-container');
    const gameContainer = document.getElementById('game-container');

    document.getElementById('create-btn').addEventListener('click', () => {
      mainMenu.classList.add('hidden');
      playMenu.classList.add('hidden');
      editorContainer.classList.remove('hidden');
      gameContainer.classList.add('hidden');

      if (!this.editor) {
        const editorCanvas = document.getElementById('editor-canvas');
        this.editor = new Editor(editorCanvas, this.level);
      }
      this.editor.render();
    });

    document.getElementById('play-btn').addEventListener('click', () => {
      mainMenu.classList.add('hidden');
      playMenu.classList.remove('hidden');
      editorContainer.classList.add('hidden');
      gameContainer.classList.add('hidden');
    });

    document.getElementById('back-to-main-btn').addEventListener('click', () => {
      mainMenu.classList.remove('hidden');
      playMenu.classList.add('hidden');
    });
  }

  initEditorUI() {
    document.getElementById('playtest-btn').addEventListener('click', () => {
      const editorContainer = document.getElementById('editor-container');
      const gameContainer = document.getElementById('game-container');
      editorContainer.classList.add('hidden');
      gameContainer.classList.remove('hidden');

      if (!this.game) {
        const gameCanvas = document.getElementById('game-canvas');
        this.game = new Game(gameCanvas);
      }

      this.game.loadLevel(this.level);
      this.game.start();
    });

    document.getElementById('save-code-btn').addEventListener('click', () => {
      const saveCode = encodeLevel(this.level);
      const textarea = document.getElementById('save-code-textarea');
      textarea.value = saveCode;
      document.getElementById('save-code-modal').classList.remove('hidden');
    });

    document.getElementById('close-modal-btn').addEventListener('click', () => {
      document.getElementById('save-code-modal').classList.add('hidden');
    });

    document.getElementById('copy-code-btn').addEventListener('click', async () => {
      const textarea = document.getElementById('save-code-textarea');
      try {
        await navigator.clipboard.writeText(textarea.value);
        document.getElementById('copy-message').textContent = 'Copied!';
      } catch (error) {
        document.getElementById('copy-message').textContent = 'Copy failed; select the text manually.';
      }
    });

    document.getElementById('exit-editor-btn').addEventListener('click', () => {
      document.getElementById('editor-container').classList.add('hidden');
      document.getElementById('main-menu').classList.remove('hidden');
    });
  }

  initGameUI() {
    document.getElementById('load-btn').addEventListener('click', () => {
      const code = document.getElementById('save-code-input').value.trim();
      const level = decodeLevel(code);
      if (!level) {
        document.getElementById('load-error').textContent = 'Invalid save code.';
        return;
      }

      this.level = level;
      document.getElementById('load-error').textContent = '';
      document.getElementById('play-menu').classList.add('hidden');
      document.getElementById('game-container').classList.remove('hidden');

      if (!this.game) {
        this.game = new Game(document.getElementById('game-canvas'));
      }

      this.game.loadLevel(level);
      this.game.start();
    });

    document.getElementById('exit-game-btn').addEventListener('click', () => {
      if (this.game) this.game.stop();
      document.getElementById('game-container').classList.add('hidden');
      document.getElementById('main-menu').classList.remove('hidden');
    });
  }
}
