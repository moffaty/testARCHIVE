class Panels {
    constructor() {
        this.rightPanel = document.querySelector('#rightPanel');
        this.leftPanel = document.querySelector('#leftPanel');
        this.centerPanel = document.querySelector('#centerPanel');
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
}

const panels = new Panels();