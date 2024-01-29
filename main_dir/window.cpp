#include "window.h"


Win::Win() : wxFrame(NULL, wxID_ANY, "Hello!")
{
    // Создаем главную панель mainpanel и устанавливаем ей цвет фона
    wxPanel *mainpanel = new wxPanel(this, wxID_ANY);
    mainpanel->SetBackgroundColour(wxColour(142, 205, 226));

    // Создаем TableWidget panel и устанавливаем ей цвет фона
    panel = new TableWidget(mainpanel, wxID_ANY, wxDefaultSize, wxDefaultPosition);
    //    m_customScrollPanel = new CustomScrollPanel(mainpanel);
    // Добавляем  столбцы в panel
    std::vector<std::pair<wxString, int>>  headerTextAndProps = {
        {wxString("Name WP"), 1},
        {wxString("latitude"), 2},
        {wxString("longitude"), 2},
        {wxString("R c"), 1},
        {wxString("y"), 1},
        {wxString("D min"), 2},
        {wxString("D pr"), 2},
        {wxString("a"), 1},
        {wxString("Va"), 2},
        {wxString("K"), 1},
        {wxString("Dlox"), 2},
        {wxString("Dort"), 1},
        {wxString("AD"), 1},
        {wxString("T"), 2},
        {wxString("D do"), 1},
        {wxString("T do"), 2},
        {wxString("T pr"), 2},
        {wxString("T st"), 2}
    };

    panel->AddStringsToHeader(headerTextAndProps);
panel->SetVisible(0, false);
    // Добавляем виджеты в panel
    panel->ChangeRowOrder(0);
    panel->AddWidgetToScroll(WidgetType::wxTextCtrl, 1);
    panel->AddWidgetToScroll(WidgetType::wxSpinCtrlDouble, 1);
    panel->AddWidgetToScroll(WidgetType::wxDatePicker, 1);
    panel->AddWidgetToScroll(WidgetType::wxStaticText, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 2);
    panel->AddWidgetToScroll(WidgetType::ssTextCtrl, 0);


    //    panel->SetNewSize(wxSize(1374, 215));
    // Создаем пустой элемент (отступ) для размещения
    wxPanel *topSpacer = new wxPanel(mainpanel, wxID_ANY);
    wxPanel *lowerSpacer = new wxPanel(mainpanel, wxID_ANY);

    wxButton* button = new wxButton(mainpanel, wxID_ANY);

    // Создаем вертикальный сизер для mainpanel
    wxBoxSizer* verticalMainSizer = new wxBoxSizer(wxVERTICAL);

    verticalMainSizer->Add(topSpacer, 1, wxEXPAND, 0); // Отступ сверху
    verticalMainSizer->Add(panel, 3, wxALIGN_CENTER, 0);
    verticalMainSizer->Add(lowerSpacer, 1, wxEXPAND, 0); // Отступ снизу
    verticalMainSizer->Add(button, 1, wxEXPAND, 0);

    // Устанавливаем вертикальный сизер как сизер для mainpanel
    mainpanel->SetSizerAndFit(verticalMainSizer);

    // Устанавливаем mainpanel как сизер для wx
    Layout();

    Bind(wxEVT_CLOSE_WINDOW, &Win::OnClose, this);
    //    button->Bind(wxEVT_BUTTON, &Win::OnCloseButtonClick, this);

    panel->Bind(wxEVT_TABLEWIDGETS, &Win::OnCustomEvent, this);

    panel->Bind(wxEVT_TABLEADDINGROW, &Win::onADD, this);
    panel->Bind( wxEVT_TABLEADDEDROW, &Win::onADDED, this);
    panel->Bind(wxEVT_TABLEMOVINGROW, &Win::OnMove, this);
    panel->Bind(wxEVT_TABLEDELLINGROW, &Win::OnDeleteRequest, this);

    panel->Bind(wxEVT_TABLEMOVESTART, &Win::OnMoveStart, this);


    panel->Bind(wxEVT_TABLECOLORWIDGET, &Win::ColorWidget, this);
    panel->Bind(wxEVT_TABLEDELLEDROW, &Win::DeletRowEnd, this);
    panel->Bind(wxEVT_TABLEMOVEDROW, &Win::OnMove, this);
    button->Bind(wxEVT_BUTTON, &Win::Delete, this);
    //добавляем строки
    panel->AddRow();
    panel->AddRow();
    panel->AddRow();
    //panel->Hide();
    panel->SetSize(wxSize(100, 600));
    SetSize(wxSize(1000, 600));
    SetMinSize(wxSize(1374, 216));
}

void Win::Delete(wxCommandEvent& event){
    int c = panel->GetRowCount();
    wxLogDebug("row %d", panel->GetRowCount());
    for (int i = panel->GetRowCount(); i >= 0; --i){
        panel->DeleteRow(panel->GetRowCount() - 1);
    }

    int d = panel->GetRowCount();
    wxLogDebug("row all %d", panel->GetRowCount());

}


void Win::onADD(wxCommandEvent& event) {
    void* eventData = event.GetClientData();
    if (!eventData) {
        event.Skip();
        return;
    }

    widgetInfo* info = static_cast<widgetInfo*>(eventData);
    int row = info->row;
    MyActionType eventType = info->eventType;

    if (eventType == MyActionType::AddRowStart) {
        wxLogDebug("AddRowStart %d", row);
        event.SetInt(true);
    }

    event.Skip();
}

void Win::onADDED(wxCommandEvent& event) {
    void* eventData = event.GetClientData();
    if (!eventData) {
        event.Skip();
        return;
    }
    widgetInfo* info = static_cast<widgetInfo*>(eventData);
    int row = info->row;
    MyActionType eventType = info->eventType;

    if (eventType == MyActionType::AddRowEnd) {
        wxLogDebug("AddRowEnd - %d", row);
        wxLogDebug("all row - %d", panel->GetRowCount());
        event.SetInt(true);
    }

    event.Skip();
}

void Win::OnCustomEvent(wxCommandEvent& event) {
    void* eventData = event.GetClientData();
    if (eventData) {
        widgetInfo* info = static_cast<widgetInfo*>(eventData);

        int row = info->row;
        int col = info->col;
        wxString text = info->text;
        bool value = info->value;
        MyActionType eventType = info->eventType;

        if (eventType == MyActionType::FocusGained) {
            wxLogDebug("Focus Gained  row - %d , colum - %d", row, col);
        }
        else if(eventType == MyActionType::FocusLost){
            wxLogDebug("Focus lost row - %d , colum - %d", row, col);
        }
        else if(eventType == MyActionType::EnterPressed){
            wxLogDebug("Enter Pressed row - %d , colum - %d", row, col);
        }
        else if(eventType == MyActionType::TextChanged){
            wxLogDebug("Text Changed row - %d , colum - %d , newText - %s", row, col, text);
        }
    }
}

Win::~Win()
{

}

void Win::OnDeleteRequest(wxCommandEvent& event)
{
    void* eventData = event.GetClientData();
    if (eventData) {
        widgetInfo* info = static_cast<widgetInfo*>(eventData);
        int row = info->row;
        MyActionType eventType = info->eventType;
        if (eventType == MyActionType::DeleteRowStart) {
            event.SetInt(true); // Разрешение выполнения операции
        }
        else if (eventType == MyActionType::DeleteRowEnd) {
            wxLogDebug("OnDelete: rowDel - %d", row);
            int numRows = panel->GetRowCount();

            int numCols = panel->GetColumnCount();
            wxLogDebug("End numCols- %d  numRow - %d", numCols, numRows);
        }
    }
}

void Win::OnMove(wxCommandEvent& event)
{
    void* eventData = event.GetClientData();
    if (eventData) {
        widgetInfo* info = static_cast<widgetInfo*>(eventData);
        int rowWas = info->rowWas;
        int rowNew = info->rowNew;

        int numCols = panel->GetColumnCount();

        MyActionType eventType = info->eventType;
        if (eventType == MyActionType::MoveRowStart) {
          
	for (int col = 0; col <= numCols; ++col){
 	      wxWindow* widget = panel->GetWidget(rowWas, col);
	   }
            event.SetInt(true); // Разрешение выполнения операции
        }
        else if (eventType == MyActionType::MoveRowEnd) {
            wxLogDebug("Move row from  %d to %d", rowWas, rowNew);
            int numRows = panel->GetRowCount();
            int numCols = panel->GetColumnCount();
            for (int col = 0; col < numCols; ++col){
                wxWindow* widget = panel->GetWidget(rowNew, col);
                widget->SetBackgroundColour(wxColor(255, 255, 255));
                ssTextCtrl* textCtrl = dynamic_cast<ssTextCtrl*>(widget);
                if (textCtrl) {
                    textCtrl->SetBackgroundColour(wxColor(255, 255, 255));
                }
           }
            wxLogDebug("End numCols- %d  numRow - %d", numCols, numRows);
        }
    }
}

void Win::OnMoveStart(wxCommandEvent& event)
{
    void* eventData = event.GetClientData();
    if (eventData) {
        widgetInfo* info = static_cast<widgetInfo*>(eventData);
        int rowWas = info->rowWas;
            wxLogDebug("Move row from  %d", rowWas);
            int numRows = panel->GetRowCount();
            int numCols = panel->GetColumnCount();
            wxLogDebug("start numCols- %d  numRow - %d", numCols, numRows);
   			for (int col = 0; col < numCols; ++col){
 			    wxWindow* widget = panel->GetWidget(rowWas, col);
                //widget->SetBackgroundColour(wxColor(255, 205, 0));
                ssTextCtrl* textCtrl = dynamic_cast<ssTextCtrl*>(widget);
                if (textCtrl) {
                    //textCtrl->SetBackgroundColour(wxColor(255, 205, 0));
                }
	       }
	   }
	 event.Skip(); 
}


void Win::buutonevent(wxCommandEvent &event)
{

    but = !but;
}

void  Win::OnClose(wxCloseEvent& event) 
{

    event.Skip();  // Позволить закрытие окна

}

void  Win::OnCloseButtonClick(wxCommandEvent& event) 
{

    panel->Show(false);
}


void Win::ColorWidget(wxCommandEvent& event)
{
    int numRows = panel->GetRowCount();
    int numCols = panel->GetColumnCount();

    wxColor borderColorBlue(84, 97, 225);
    wxColor borderColorGray(206, 206, 206);

    for (int row = 0; row <= numRows; ++row) {
        for (int col = 0; col <= numCols; ++col) {
            wxWindow* widget = panel->GetWidget(row, col);
            if (widget) {
                ssTextCtrl* textCtrl = dynamic_cast<ssTextCtrl*>(widget);
                if (textCtrl) {
                    if (col < 12) {
                        textCtrl->SetBorderColour(borderColorBlue);
                    } 
                    else if (col < 18) {
                        textCtrl->SetBorderColour(borderColorGray);
                    }
                    textCtrl->SetRadius(9);
                    textCtrl->SetMargins(5, 2);
                }
                

            }
        }
    }

}

void Win::DeletRowEnd(wxCommandEvent& event) 
{
    void* eventData = event.GetClientData();
    if (eventData) {
        widgetInfo* info = static_cast<widgetInfo*>(eventData);
        int row = info->row;
        MyActionType eventType = info->eventType;
        if (eventType == MyActionType::DeleteRowEnd) {
            wxLogDebug("OnDelete: rowDel - %d", row);
            int numRows = panel->GetRowCount();

            int numCols = panel->GetColumnCount();
            wxLogDebug("End to del numCols- %d  numRow - %d", numCols, numRows);
        }

    }
}

