class Panels {
    constructor() {
        this.rightPanel = document.querySelector('#rightPanel');
        this.leftPanel = document.querySelector('#leftPanel');
        this.centerPanel = document.querySelector('#centerPanel');
        this.centerDir = document.querySelector('#centerDir');
    }
    
    _getRightPanel() {
        return this.rightPanel;
    }
    
    _getLeftPanel() {
        return this.leftPanel;
    }

    _getCenterPanel() {
        return this.centerPanel;
    }

    _getCenterDir() {
        return this.centerDir;
    }
}

const panels = new Panels();