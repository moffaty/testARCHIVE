#include "TableWidget.h"

#include <wx/scrolwin.h>

wxDEFINE_EVENT(wxEVT_TABLEADDINGROW, wxCommandEvent);
wxDEFINE_EVENT(wxEVT_TABLEDELLINGROW, wxCommandEvent);
wxDEFINE_EVENT(wxEVT_TABLEMOVINGROW, wxCommandEvent);

wxDEFINE_EVENT(wxEVT_TABLEWIDGETS, wxCommandEvent);

wxDEFINE_EVENT(wxEVT_TABLEADDEDROW, wxCommandEvent);
wxDEFINE_EVENT(wxEVT_TABLEDELLEDROW, wxCommandEvent);
wxDEFINE_EVENT(wxEVT_TABLEMOVEDROW, wxCommandEvent);

wxDEFINE_EVENT(wxEVT_TABLECOLORWIDGET, wxCommandEvent);

wxDEFINE_EVENT(UPDATE_HEADER_POSITION, wxCommandEvent);

wxDEFINE_EVENT(wxEVT_TABLEMOVESTART, wxCommandEvent);

TableWidget::TableWidget(wxWindow* parent, wxWindowID id, const wxSize& size, const wxPoint& position) : wxPanel(parent, id, position, size, wxBORDER_THEME | wxCAPTION), m_size(size)
{
    SetBackgroundColour(wxColour(255, 255, 255));
    SetObj();
}

void TableWidget::SetObj() {
    scrollWindowHeader = new wxScrolledWindow(this, wxID_ANY);
    scrollWindowHeader->SetScrollRate(10, 0); // Установка скорости прокрутки, если необходимо
    // Заблокируйте скролл вне функции OnSyncScroll
    scrollWindowHeader->Disable();
    m_addRowButton = new ssButton(this, wxID_ANY, "H");


    m_addRowButton->SetFont(wxFont(30, wxFONTFAMILY_DEFAULT, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL, false, "Helvetica"));
    m_addRowButton->SetFigure(true, ssButton::Figures::Lines);
    // m_addRowButtonton->SetFigure(true, ssButton::Figures::Lines);
    m_addRowButton->SetFigureAngle(0);
    m_addRowButton->SetBorderColour(wxColor(126, 126, 126));
    //m_addRowButton->SetBackgroundColour(wxColor(255, 255, 255));
    m_addRowButton->SetForegroundColour(wxColor(126, 126, 126));

    m_addRowButton->SetBackgroundColour(wxColor(255, 255, 255), ssButton::State::Default);
    //m_addRowButton->SetBackgroundColour(wxColor(255, 255, 255), ssButton::State::StateCount);
   // m_addRowButton->SetBackgroundColour(wxColor(255, 255, 255), ssButton::State::Toggled);
    m_addRowButton->SetBackgroundColour(wxColor(235, 237, 255), ssButton::State::Focused);
    m_addRowButton->SetBackgroundColour(wxColor(235, 237, 251), ssButton::State::Pressed);
    m_addRowButton->SetBackgroundColour(wxColor(235, 237, 255), ssButton::State::Hovered);
    m_addRowButton->SetFigureWidth(2);
    m_addRowButton->SetFigureSize(17);
    // m_addRowButton->SetSize(wxSize(36,36));
     // Создаем вертикальный сайзер
    m_mainPanelVerticalSizer = new wxBoxSizer(wxVERTICAL);
    m_mainVerticalSizer = new wxBoxSizer(wxVERTICAL);

    // Создаем первый горизонтальный сайзер для заголовка
    m_horizontalSizerHeder = new wxBoxSizer(wxHORIZONTAL);

    // Создаем второй горизонтальный сайзер для содержимого
    m_horizontalSizerScrollWin = new wxBoxSizer(wxVERTICAL);

    //Создаем второй горизонтальный сайзер для кнопки
    m_horizontalSizerButton = new wxBoxSizer(wxVERTICAL);

    scrollWindowHeader->SetSizer(m_horizontalSizerHeder);
    // Создаем объект CustomScrollWindow
    m_scrollWindow = new CostumScrollWindow(this);

    wxStaticText* newText = new wxStaticText(scrollWindowHeader, wxID_ANY, "", wxDefaultPosition, wxSize(35, 0), wxALIGN_CENTER_HORIZONTAL);
    // Создаем объект, который всегда должен быть в конце сайзера заголовка
    alwaysAtEnd = new wxStaticText(scrollWindowHeader, wxID_ANY, "", wxDefaultPosition, wxDefaultSize, wxALIGN_CENTER_HORIZONTAL);

    m_mainPanelVerticalSizer->Add(m_mainVerticalSizer, 1, wxEXPAND | wxALL, 0);
    //newText->SetSize(wxSize(50, 50));
    m_horizontalSizerHeder->Add(newText, 0, wxBOTTOM | wxLEFT, 10);
    m_horizontalSizerScrollWin->Add(m_scrollWindow, 1, wxEXPAND | wxALL, 0);
    m_horizontalSizerButton->Add(m_addRowButton, 1, wxLEFT, 15); // Второй горизонтальный сайзер

    m_mainVerticalSizer->Add(scrollWindowHeader, 0, wxEXPAND | wxTOP | wxBOTTOM, 3); // Первый горизонтальный сайзер
    m_mainVerticalSizer->Add(m_horizontalSizerScrollWin, 1, wxEXPAND | wxALL, 0); // Второй горизонтальный сайзер
    m_mainVerticalSizer->Add(m_horizontalSizerButton, 0, wxEXPAND | wxLEFT | wxRIGHT | wxBOTTOM | wxTOP, 5); // Второй горизонтальный сайзер

    // Устанавливаем вертикальный сайзер как основной сайзер панели
    SetSizer(m_mainPanelVerticalSizer);

    // Обновляем макет
    m_horizontalSizerHeder->Layout();
    m_mainPanelVerticalSizer->Layout();
    m_addRowButton->Bind(wxEVT_SSBUTTON, &TableWidget::OnAddButtonRow, this);
    m_scrollWindow->Bind(wxEVT_TABLEDELLEDROW, &TableWidget::DeletRowEnd, this);
    Bind(UPDATE_HEADER_POSITION, &TableWidget::OnUpdateHeaderPosition, this);

}

void TableWidget::OnUpdateHeaderPosition(wxCommandEvent& event) {
    scrollWindowHeader->SetScrollRate(10, 0); // Установка скорости прокрутки, если необходимо
    scrollWindowHeader->Enable();
    int scrollPosition = event.GetInt();

    scrollWindowHeader->Scroll(scrollPosition, 0);
    Refresh();
    Update();
    scrollWindowHeader->Layout();


    scrollWindowHeader->Disable();
    //  m_horizontalSizerHeder->Layout();
        // scrollWindowHeader->SetScrollRate(0, 0); // Установка скорости прокрутки, если необходимо

}

void TableWidget::SetFont(wxFont userFont) {
    m_font = userFont;
}
bool TableWidget::CheckIfFunctionIsIdle() {
    static wxStopWatch stopWatch; // Создайте статический таймер

    if (stopWatch.Time() > 200) { // Если прошло более 2 секунд
        stopWatch.Start(); // Перезапустите таймер
        return true;
    }
    else {
        return false;
    }
}

void TableWidget::DeletRowEnd(wxCommandEvent& event)
{
    scrollWindowHeader->Enable();


    scrollWindowHeader->SetScrollRate(10, 0);
    int posOld = scrollWindowHeader->GetScrollPos(wxHORIZONTAL);
    int posNew = posOld - 1000;
    int row = m_scrollWindow->GetRowCount();
    if (row == 0) {
        scrollWindowHeader->Scroll(1000, 100);
    }
    scrollWindowHeader->Disable();
    Refresh();
    Update();

}




//Функция скрытия
void TableWidget::Hide() {

    Show(false);
}


void TableWidget::ClearAllRows() {
    m_scrollWindow->DeleteRows();
}

void TableWidget::DeleteRow(int row1)
{
    if (row1 >= 0) {
        m_scrollWindow->DeleteRow(row1);
        m_scrollWindow->DeleteRowNum();
        wxLogDebug("row del %d", row1);
    }
}

//функция убирает из видимости виждет
void TableWidget::SetVisible(int col, bool isVis) {

    if (col >= 0 && col < m_vectorHeader.size()) {
        m_vectorHeader[col]->Show(isVis);

    }
    m_horizontalSizerHeder->Layout();
    m_scrollWindow->OnSetVisible(col, isVis);
    m_scrollWindow->Refresh();
    m_scrollWindow->RefreshLayout();
}
//функция полной очистки таблицы
void TableWidget::ResetPanel() {
    m_scrollWindow->m_widgets.clear();
    m_scrollWindow->m_DelWidgets.clear();
    m_scrollWindow->m_panelVector.clear();
    m_scrollWindow->m_MainpanelVector.clear();
    m_scrollWindow->m_delCol.clear();
    m_scrollWindow->m_staticTextVector.clear();
    m_scrollWindow->m_vectorButtons.clear();
    m_scrollWindow->m_addedWidgetsType.clear();
    m_colum = 0;
    for (size_t i = GetChildren().GetCount(); i > 0; i--) {
        wxWindow* child = GetChildren().Item(i - 1)->GetData();
        child->Destroy(); // Уничтожение дочерних элементов
    }

    SetObj();
    // После очистки, перерисовываем wxPanel
    Refresh();
    Update();
}

void TableWidget::MoveRow(int oldRow, int newRow)
{
    m_scrollWindow->MoveRow(oldRow, newRow);
}
//функция добавления заголовка
void TableWidget::AddStringsToHeader(const std::vector<std::pair<wxString, int>>& textAndProp) {
    for (const auto& pair : textAndProp) {
        const wxString& text = pair.first;
        int proportion = pair.second;

        wxStaticText* newText = new wxStaticText(scrollWindowHeader, wxID_ANY, text, wxDefaultPosition, wxDefaultSize, wxALIGN_CENTER_HORIZONTAL);
        newText->SetFont(m_font);

        m_horizontalSizerHeder->Add(newText, proportion, wxBOTTOM, 1);

        m_vectorHeader.push_back(newText);
    }
    //textAndProp1 = textAndProp;
    // Перераспределяем расположение элементов в сайзере
    m_horizontalSizerHeder->Detach(alwaysAtEnd);
    m_horizontalSizerHeder->Add(alwaysAtEnd, 1, wxLEFT |
        wxRIGHT, 40);
    m_horizontalSizerHeder->Layout();

    Refresh();
}


wxWindow* TableWidget::GetHeader(int col) {
    if (col >= 0 && col < m_vectorHeader.size())
    {
        return m_vectorHeader[col];
    }
    return nullptr;
    m_horizontalSizerHeder->Layout();
    m_mainPanelVerticalSizer->Layout();
}

int TableWidget::getLastUsedRow() const
{
    int lastUsedRow = m_scrollWindow->getLastUsedRow();
    wxLogDebug(" lastrow - %d", lastUsedRow);
    return lastUsedRow;
}

//функция добавления виджета
void TableWidget::AddWidgetToScroll(WidgetType WidType, int proporion, wxValidator* UseValidator)
{
    m_scrollWindow->AddWidgetButton(WidType, proporion, UseValidator);
    m_colum = m_colum + 1;

    // m_scrollWindow->SetSize(m_size);
    SetSize(wxSize(m_size.x, m_size.y));
    SetMaxSize(wxSize(m_size.x, m_size.y));
    m_addRowButton->Show(true);
    wxWindow* parent = m_mainPanelVerticalSizer->GetContainingWindow(); // Получите родительское окно
    Prop.push_back(proporion);
    m_size = GetMinSize();
    if (parent)
    {
        parent->Fit();
        parent->Layout();  // Пересчитайте размеры дочерних элементов родительского окна
        parent->Refresh(); // Обновите отображение родительского окна
    }
    Fit();
    bool is_table_empty = !m_scrollWindow->GetRowCount();
    if (is_table_empty)
        m_scrollWindow->AddWidgetRow();

    int scroll = GetColumnCount();
    for (int i = 0; i <= scroll; i++)
        AlignHeaderWithWidget(i);
    if (is_table_empty)
        m_scrollWindow->DeleteRows();

    //m_horizontalSizerHeder->Layout();
    m_mainPanelVerticalSizer->Layout();
}

//функция добавления строки с виджетами
void TableWidget::AddRow()
{
    m_scrollWindow->AddWidgetRow();
    GenerateColor();
}

void TableWidget::GenerateColor() //создание события
{
    wxCommandEvent event(wxEVT_TABLECOLORWIDGET, GetId());
    ProcessWindowEvent(event);
}

//функция возвращающая количество колонок
int TableWidget::GetColumnCount() const
{
    return m_scrollWindow->GetColum();
}

//функция возвращающая количество строк
int TableWidget::GetRowCount()
{
    int row = m_scrollWindow->GetRowCount();
    return row;
}

//функция выбора виджета
wxWindow* TableWidget::GetWidget(int row, int col)
{
    // Вычисляем индекс вектора на основе строки и колонки
    int index = row * m_colum + col;

    wxWindow* widget = m_scrollWindow->GetWidgetByIndex(index);
    return widget;
}


void TableWidget::DeleteColum(int col)
{
    std::vector<int> indexes;

    int m_rows = m_scrollWindow->GetRowCount();
    int row = 0;
    if (col >= 0 && col <= m_colum)
    {
        for (row >= 0; row <= m_rows; row++) {
            int index = row * m_colum + col;
            indexes.push_back(index);
        }
    }
    m_scrollWindow->onDeleteColum(indexes, col);

    if (col >= 0 && col < m_vectorHeader.size()) {
        // Получаем указатель на удаляемый объект из вектора m_widgets
        wxWindow* widgetToRemove = m_vectorHeader[col];

        // Проверяем, был ли объект создан с использованием new
        if (widgetToRemove) {
            // Заменяем элемент в векторе на nullptr
            m_vectorHeader[col] = nullptr;

            // Удаляем объект
            delete widgetToRemove;
        }
    }
    for (int i = indexes.size() - 1; i >= 0; --i) {
        int index = indexes[i];
        if (index >= 0 && index < m_vectorHeader.size()) {
            // Удаляем элемент из вектора m_widgets по индексу

            m_vectorHeader.erase(m_vectorHeader.begin() + index);
        }
    }

}




TableWidget::~TableWidget()
{

}

void TableWidget::SetRowInWindow(int row)
{
    m_rowSee = row;
}

//функция добавления виджета через кнопку
void TableWidget::OnAddButtonRow(wxCommandEvent& event)
{
    //    Freeze();
    bool isApproved = m_scrollWindow->GenerateAddNewRowEventStart();

    if (!isApproved) {
        wxLogDebug("Operation rejected. %d", isApproved);
        return; // Прервать выполнение операции
    }
    m_scrollWindow->Freeze();
    m_scrollWindow->AddWidgetRow();
    m_scrollWindow->GenerateAddNewRowEvenEnd();
    GenerateColor();

    int row = m_scrollWindow->GetRowCount();
    if (row == 1) {
        scrollWindowHeader->Scroll(0, 0);
    }

    // Получить текущее вертикальное положение прокрутки
    int currentScrollPos = m_scrollWindow->GetScrollPos(wxVERTICAL);
    int currentScrollPos2 = m_scrollWindow->GetScrollPos(wxHORIZONTAL);

    // Установите новое вертикальное положение прокрутки
    int newYPosition = currentScrollPos + 100; // сдвиг на 100 пикселей вниз
    m_scrollWindow->Scroll(currentScrollPos2, newYPosition);
    int scroll = GetColumnCount();
    for (int i = 0; i <= scroll; i++) {
        AlignHeaderWithWidget(i);
    }
    m_scrollWindow->Thaw();
}

void TableWidget::SetNewSize(const wxSize& newSize)
{

}

wxSize TableWidget::GetMinSize() {
#ifdef __linux__
    int h = 40 * m_rowSee + 95;
#elif defined(__WXMSW__)
    int h = 45 * m_rowSee + 95;
#endif
    int w = CalculateOptimalSize(Prop) + 100;
    m_scrollWindow->SetSize(wxSize(w, h));
    wxWindow* parent = m_mainPanelVerticalSizer->GetContainingWindow(); // Получите родительское окно

    if (parent) {
        parent->Fit();

        parent->Layout();  // Пересчитайте размеры дочерних элементов родительского окна
        parent->Refresh(); // Обновите отображение родительского окна
    }
    Fit();

    int scroll = GetColumnCount();
    for (int i = 0; i <= scroll; i++) {
        AlignHeaderWithWidget(i);
    }

    return wxSize(w, h);
}


int TableWidget::CalculateOptimalSize(std::vector<int> Prop) {
    int result = 0;

    for (const auto& pair : Prop) {
        int value = pair;
        switch (value) {
        case 0:
            result += 80;

            break;
        case 1:
            result += 100;

            break;
        case 2:
            result += 120;

            break;
        case 3:
            result += 140;
            break;
            // Можно добавить дополнительные случаи, если необходимо
        }
    }

    return result;
}


//функция возвращающая размер
wxSize TableWidget::GetSize()
{
    return m_size;
}

//функция которая ставит размер по индексу виджета
void TableWidget::SetWidgetSize(size_t index, wxSize newSize)
{
    m_scrollWindow->SetWidgetSize(index, newSize);
}

//функция которая добавляет столбик с нумерацией
void TableWidget::ChangeRowOrder(int proportion)
{
    m_scrollWindow->ChangeRowOrder(proportion);
    m_changeRowOrder = true;
    wxString text = wxString::Format(wxT("%c"), wxChar(8470));
    wxStaticText* staticText = new wxStaticText(scrollWindowHeader, wxID_ANY, text, wxDefaultPosition, wxDefaultSize, wxALIGN_CENTER_HORIZONTAL);
    staticText->SetFont(m_font);   // Вставляем wxStaticText в начало сизера
    m_horizontalSizerHeder->Insert(1, staticText, proportion, wxRIGHT | wxLEFT | wxBOTTOM, 1);
}

void TableWidget::AlignHeaderWithWidget(int widgetIndex) {
    //    if (widgetIndex >= 0 && widgetIndex < m_vectorHeader.size()) {
    //        wxWindow* widget = m_scrollWindow->GetWidgetByIndex(widgetIndex);
    //        if (widget) {
    //            // Получите виртуальную позицию объекта widget
    //            wxPoint widgetVirtualPosition = widget->GetPosition();

    //            if (widgetVirtualPosition.x >= 0) {
    //                // Преобразуйте виртуальные координаты в экранные
    //                wxPoint widgetScreenPosition = m_scrollWindow->CalcScrolledPosition(widgetVirtualPosition);

    //                // Установите позицию объекта m_vectorHeader на ту же позицию по X
    //                wxWindow* header = m_vectorHeader[widgetIndex];
    //                if (header) {
    //                    header->Move(wxPoint(widgetScreenPosition.x , header->GetPosition().y));
    //                }
    //            }
    //        }
    //    }
    Refresh();
}



//класс Scrollwindow
CostumScrollWindow::CostumScrollWindow(wxWindow* parent) : wxScrolledWindow(parent, wxID_ANY, wxDefaultPosition, wxDefaultSize, wxVSCROLL | wxHSCROLL | wxALWAYS_SHOW_SB | wxFULL_REPAINT_ON_RESIZE)
{
    m_contentSizer = new wxBoxSizer(wxVERTICAL);
    SetSizer(m_contentSizer);


    // Добавляем вертикальный ползунок прокрутки в сизер
    SetScrollRate(10, 10); // Устанавливаем скорость прокрутки по вертикали
    SetVirtualSize(1300, 300);
    FitInside();

    Bind(wxEVT_SCROLLWIN_TOP, &CostumScrollWindow::OnScrolll, this);
    Bind(wxEVT_SCROLLWIN_BOTTOM, &CostumScrollWindow::OnScrolll, this);
    Bind(wxEVT_SCROLLWIN_LINEUP, &CostumScrollWindow::OnScrolll, this);
    Bind(wxEVT_SCROLLWIN_LINEDOWN, &CostumScrollWindow::OnScrolll, this);
    Bind(wxEVT_SCROLLWIN_PAGEUP, &CostumScrollWindow::OnScrolll, this);
    Bind(wxEVT_SCROLLWIN_PAGEDOWN, &CostumScrollWindow::OnScrolll, this);
    Bind(wxEVT_SCROLLWIN_THUMBTRACK, &CostumScrollWindow::OnScrolll, this);
    Bind(wxEVT_SCROLLWIN_THUMBRELEASE, &CostumScrollWindow::OnScrolll, this);


}

//функция ставит размер Scrollwindow, считает как заданый размер минус кнопка и пространство для кнопки
void CostumScrollWindow::SetSize(wxSize userSize)
{
    m_size = wxSize(userSize.x, userSize.y - 60);
    //    SetSize(wxSize(m_size.x, m_size.y));
    SetMinSize(wxSize(m_size.x, m_size.y));
    Refresh();
}

//функция добавления виджета в строку
void CostumScrollWindow::AddWidgetButton(WidgetType WidType, int proportion, wxValidator* UseValidator)
{
    m_addedWidgetsType.push_back({WidType, proportion, UseValidator});
    m_colum = m_colum + 1;
}

//функция добавления строки с виджетами
void CostumScrollWindow::AddWidgetRow()
{
    Freeze();

    UpdateUI();
    m_mainPanel = new wxPanel(this, m_ID, wxDefaultPosition, wxSize(100, 36));
    m_ScrollWinMainSizer = new wxBoxSizer(wxHORIZONTAL);
    m_mainPanel->SetBackgroundColour(wxColor(255, 255, 255));
    m_newPanel = new wxPanel(m_mainPanel, m_ID, wxDefaultPosition, wxSize(100, 36), wxBORDER_NONE);
    m_newPanel->SetWindowStyleFlag(m_newPanel->GetWindowStyleFlag() & ~wxBORDER_THEME);

    m_newPanel->SetBackgroundColour(wxColor(255, 255, 255));

    wxBoxSizer* m_newRowSizer = new wxBoxSizer(wxHORIZONTAL);
    wxBoxSizer* newRowSizerwidgets = new wxBoxSizer(wxHORIZONTAL);

    // Создаем панель для goButton
    wxPanel* goButtonPanel = new wxPanel(m_mainPanel, wxID_ANY, wxDefaultPosition, wxDefaultSize);
    goButtonPanel->SetBackgroundColour(wxColor(255, 255, 255));

    m_goButton = new ssButton(goButtonPanel, m_ID, "", wxDefaultPosition, wxSize(33, 36));

    m_goButton->SetFont(wxFont(5, wxFONTFAMILY_DEFAULT, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL, false, "Helvetica"));
    //    m_goButton->SetFigure(true);
    m_goButton->SetFigure(true, ssButton::Figures::Menu, true, 0, 17.5);
    m_goButton->SetFigureAngle(0);
    m_goButton->SetBorderColour(wxColor(255, 255, 255));
    m_goButton->SetBackgroundColour(wxColor(255, 255, 255), ssButton::State::Default);
    m_goButton->SetBackgroundColour(wxColor(235, 237, 255), ssButton::State::Focused);
    m_goButton->SetFigureColour(wxColor(206, 206, 206));

    m_goButton->SetForegroundColour(wxColor(206, 206, 206));
    m_goButton->SetMinSize(wxSize(5, 5));

    if (m_changeOrder) {
        m_changeOrderStr = new wxStaticText(m_newPanel, m_ID, "1", wxDefaultPosition, wxDefaultSize, wxALIGN_CENTER_HORIZONTAL | wxST_NO_AUTORESIZE);
        m_newRowSizer->Add(m_changeOrderStr, m_changeOrderpropor, wxTOP, 10);
        m_changeOrderStr->SetMinSize(wxSize(30, -1)); // Ширина 60 пикселов, высоту можно оставить по умолчанию

        m_staticTextVector.push_back(m_changeOrderStr);
    }

    for (const AddedWidgetDesc& WidgetDesc : m_addedWidgetsType)
    {
        newRowSizerwidgets = CreateWidgets(WidgetDesc);
        m_newRowSizer->Add(newRowSizerwidgets, WidgetDesc.proportion, wxTOP | wxBOTTOM, 0);
    }

    m_deletButton = new ssButton(m_mainPanel, m_ID, "x", wxDefaultPosition, wxDefaultSize, wxBORDER_NONE);

    m_deletButton->SetFont(wxFont(1, wxFONTFAMILY_DEFAULT, wxFONTSTYLE_NORMAL, wxFONTWEIGHT_NORMAL, false, "Helvetica"));
    m_deletButton->SetFigure(true);
    // m_deletButton->SetFigure(true, ssButton::Figures::Lines);
    m_deletButton->SetFigureAngle(45);
    m_deletButton->SetBorderColour(wxColor(255, 255, 255));
    m_deletButton->SetBackgroundColour(wxColor(255, 255, 255));
    m_deletButton->SetForegroundColour(wxColor(206, 0, 0));
    m_deletButton->SetFigureWidth(2);
    m_deletButton->SetFigureSize(10);

    m_deletButton->SetMaxSize(wxSize(30, 30));
    m_contentSizer->Add(m_mainPanel, 0, wxEXPAND | wxTOP | wxBOTTOM, 2);

    m_newPanel->SetSizer(m_newRowSizer);

    m_ScrollWinMainSizer->Add(goButtonPanel, 0, wxLEFT, 10);
    m_ScrollWinMainSizer->Add(m_newPanel, 3, wxEXPAND | wxALL, 0);
    m_ScrollWinMainSizer->Add(m_deletButton, 0, wxEXPAND | wxRIGHT, 10);

    m_mainPanel->SetSizer(m_ScrollWinMainSizer);

    m_MainpanelVector.push_back(m_mainPanel);
    m_panelVector.push_back(m_newPanel);

    m_vectorButtons.push_back(m_goButton);


    m_goButton->Bind(wxEVT_LEFT_DOWN, &CostumScrollWindow::OnLeftDown, this);
    m_goButton->Bind(wxEVT_LEFT_UP, &CostumScrollWindow::OnLeftUp, this);
    m_goButton->Bind(wxEVT_MOTION, &CostumScrollWindow::OnMotion, this);

    m_goButton->Bind(wxEVT_ENTER_WINDOW, &CostumScrollWindow::OnMouseEnter, this);
    m_goButton->Bind(wxEVT_LEAVE_WINDOW, &CostumScrollWindow::OnMouseLeave, this);
    m_goButton->Bind(wxEVT_SSBUTTON, &CostumScrollWindow::OnChildButtonClicked, this);
    m_deletButton->Bind(wxEVT_LEFT_DOWN, &CostumScrollWindow::OnDeleteButton, this);

   for (int col : m_notVisCol) {
            OnSetVisible(col, false);
        }
    m_contentSizer->Layout();


    sizePanel.x = m_newRowSizer->GetMinSize().x;
    sizePanel.y = m_contentSizer->GetMinSize().y;
    // m_mainPanel->SetMaxSize(wxSize(sizePanel.x, 36));
    m_mainPanel->SetMinSize(wxSize(sizePanel.x, 36));
    UpdateRowNumbers();
    if (row != 2) {

        FitInside();
    }

    SetVirtualSize(sizePanel.x, sizePanel.y);
    row = row + 1;
    m_ID = m_ID + 1;

    Thaw();

}

//функция выводящая виджет по индексу
wxWindow* CostumScrollWindow::GetWidgetByIndex(int index)
{
    if (index >= 0 && index < m_widgets.size())
    {
        return m_widgets[index];
    }
    return nullptr;
}




//функция удаления строк
void CostumScrollWindow::OnDeleteButton(wxMouseEvent& event) {

    int deleteButtonId = event.GetId();
    if (GetColum() > 0) {
        for (size_t i = 0; i < m_widgets.size(); i++) {
            wxWindow* widget = m_widgets[i];
            if (widget->GetId() == deleteButtonId) {
                // Объект с заданным ID найден, сохраняем его индекс в DeleteRow и выходим из цикла
                m_row = i;
                break;
            }
        }

        bool isApproved = GenerateDeleteRowFirst();


        if (!isApproved) {
            wxLogDebug("Operation rejected.");
            event.Skip();
            return; // Прервать выполнение операции
        }
        else {
            row = row - 1;
        }


        int rows = FindPanelIndexByID(deleteButtonId);


        DeleteRow(rows);
        GenerateDeleteRowSecond();

    }
    else {
        wxLogDebug("Operation rejected. %d", GetColum());
    }

}

//функция обработки события нажатия
void CostumScrollWindow::OnLeftDown(wxMouseEvent& event)
{

    m_draggedWidget = dynamic_cast<wxWindow*>(event.GetEventObject());

    leftDownFlag = false;// Устанавливаем флаг при событии "Left Down"


    int buttonID = event.GetId();
    for (wxWindow* widget : m_widgets) {
        if (!widget) {
            // Пропустить недействительные указатели
            continue;
        }

    }
    draggingPanel = FindPanelByID(buttonID);

    if (draggingPanel)
    {

        leftDownFlag = true;
        SetColor(draggingPanel);
        int index = FindItemIndex(m_contentSizer, draggingPanel);
        GenerateMoveRowStart(index);
    }
    else
    {
        event.Skip();
    }

    event.Skip();
}

//функция изменения цвета виджетов при нажатии
void CostumScrollWindow::SetColor(wxWindow* clickedWidget)
{
    if (m_IDwasClicked != -1) {

        // Проверка, существует ли виджет
        for (wxWindow* widget : m_widgets) {

            if (widget && widget->GetId() == m_IDwasClicked) {
                // Проверяем, является ли виджет объектом ssButton

                ssTextCtrl* textctrl = dynamic_cast<ssTextCtrl*>(widget);
                if (!textctrl) {

                    // Если виджет не является ssButton, то меняем цвет
                    //widget->SetBackgroundColour(wxNullColour);
                }
                else {

                    //textctrl->SetBackgroundColour(wxColor(255, 255, 255));

                    wxColour textctrlpen = textctrl->GetBorderColour(ssTextCtrl::State::Default);
                    if (textctrlpen == wxColor(255, 255, 255)) {
                        textctrl->SetBorderColour(wxColor(206, 206, 206));
                    }
                }
            }
        }
        // toreOriginalColors();
        auto it = m_panelVector.begin();

        while (it != m_panelVector.end()) {
            wxWindow* widget = *it;

            if (widget && widget->GetId() == m_IDwasClicked) {
                // Проверяем, является ли виджет объектом wxPanel
                wxPanel* panel = wxDynamicCast(widget, wxPanel);
                if (panel) {
                    widget->SetWindowStyleFlag(widget->GetWindowStyleFlag() & ~wxBORDER_THEME);
                    // Если виджет не является ssButton, то меняем цвет
                    //widget->SetBackgroundColour(wxNullColour);

                    // Передвигайтесь к следующему элементу итератора
                    ++it;
                }
                else {
                    // Если виджет не является объектом wxPanel, просто увеличьте итератор
                    ++it;
                }
            }
            else {
                // Если виджет не соответствует условиям, просто увеличьте итератор
                ++it;
            }
        }


        // Проверка, существует ли кнопка в m_vectorButtons
        for (ssButton* button : m_vectorButtons) {
            if (button && button->GetId() == m_IDwasClicked) {
                // Установка цвета кнопки в зависимости от состояния
                button->SetBackgroundColour(wxColour(255, 255, 255), ssButton::State::Default);
                button->SetBackgroundColour(wxColour(235, 237, 251), ssButton::State::Hovered);
            }
        }
    }

    if (clickedWidget) {
        int clickedID = clickedWidget->GetId();
        // Проверка, существует ли виджет
         //toreOriginalColors();
        for (wxWindow* widget : m_widgets) {
            if (!widget) {
                // Пропустить недействительные указатели
                continue;
            }
            if (widget && widget->GetId() == clickedID) {
                ssTextCtrl* textctrl = dynamic_cast<ssTextCtrl*>(widget);

                if (!textctrl) {
                    // widget->SetBackgroundColour(wxColour(255, 205, 0));
                }
                else {
                    //textctrl->SetBackgroundColour(wxColour(255, 205, 0));
                    wxColour textctrlpen = textctrl->GetBorderColour(ssTextCtrl::State::Default);
                    if (textctrlpen == wxColor(206, 206, 206)) {
                        //   textctrl->SetBorderColour(wxColor(255, 255, 255));
                    }
                }
            }
        }

        for (wxWindow* widget : m_panelVector) {
            if (widget && widget->GetId() == clickedID) {
                // Проверяем, является ли виджет объектом wxPanel
                wxPanel* panel = wxDynamicCast(widget, wxPanel);
                if (panel) {
                    widget->SetWindowStyleFlag(widget->GetWindowStyleFlag());
                    // Если виджет не является ssButton, то меняем цвет
                    widget->SetBackgroundColour(wxColour(255, 205, 0));
                }
            }
        }

        auto it = m_vectorButtons.begin();

        while (it != m_vectorButtons.end()) {
            ssButton* button = *it;

            if (button) {

                if (button->GetId() == clickedID) {
                    // Установка цвета кнопки в зависимости от состояния
                    button->SetBackgroundColour(wxColour(235, 237, 251));

                    ++it;
                }
                else {
                    ++it;
                }
            }
            else {
                wxLogDebug("Null button encountered");
                it = m_vectorButtons.erase(it);
            }
        }


        m_IDwasClicked = clickedID;
    }

    Refresh();

}

// Сохранение оригинальных цветов виджетов
void CostumScrollWindow::StoreOriginalColors(wxWindow* widget) {

}


// Восстановление оригинальных цветов виджетов
void CostumScrollWindow::RestoreOriginalColors() {

}

//функция ставящая размер виджеты по индексу(возможно не нужна и в будущем удалится)
void CostumScrollWindow::SetWidgetSize(size_t index, wxSize newSize) {
    if (index < m_widgets.size()) {
        wxWindow* widget = m_widgets[index];
        if (wxTextCtrl* textCtrl = dynamic_cast<wxTextCtrl*>(widget)) {
            textCtrl->SetSize(newSize);
        }
        else if (wxComboBox* comboBox = dynamic_cast<wxComboBox*>(widget)) {
            comboBox->SetSize(newSize);
        }
        else if (wxSpinCtrl* spinCtrl = dynamic_cast<wxSpinCtrl*>(widget)) {
            spinCtrl->SetSize(newSize);
        }
        else if (wxSpinCtrlDouble* spinCtrlDouble = dynamic_cast<wxSpinCtrlDouble*>(widget)) {
            spinCtrlDouble->SetSize(newSize);
        }
        else if (wxTimePickerCtrl* timePicker = dynamic_cast<wxTimePickerCtrl*>(widget)) {
            timePicker->SetSize(newSize);
        }
        else if (wxDatePickerCtrl* datePicker = dynamic_cast<wxDatePickerCtrl*>(widget)) {
            datePicker->SetSize(newSize);
        }
    }
    Refresh();
}

//функция создания виджетов
wxBoxSizer* CostumScrollWindow::CreateWidgets(const AddedWidgetDesc& WidgetDesc)
{
    Freeze();
    wxBoxSizer* m_newRowSizer = new wxBoxSizer(wxHORIZONTAL);
    wxString nameWithID = wxString::Format("Name%d", m_ID);
    wxWindow* newWidget = nullptr;

    const wxValidator& use_validator = WidgetDesc.validator ? *WidgetDesc.validator : wxDefaultValidator;
    switch (WidgetDesc.widget_type)
    {
    case WidgetType::ssRadio:
        newWidget = new ssRadio(m_newPanel, m_ID, wxString(""), wxDefaultPosition, wxDefaultSize, wxNO_BORDER);
        m_widgets.push_back(newWidget);
        break;
        //    case WidgetType::ssChoice:
        //        newWidget = new ssChoice(m_newPanel, m_ID, wxString(""), wxDefaultPosition, wxDefaultSize, wxNO_BORDER);
        //        m_widgets.push_back(newWidget);
        //        break;
        //    case WidgetType::ssSwitch:
        //        newWidget = new ssSwitch(m_newPanel, m_ID, wxString("Name"), wxDefaultPosition, wxSize(56, 36), wxNO_BORDER);
        //        widgets.push_back(newWidget);
        //        break;
        //    case WidgetType::ssStaticText:
        //        newWidget = new ssStaticText(m_newPanel, m_ID, wxString("Name"), wxDefaultPosition, wxDefaultSize, wxNO_BORDER);
        //        widgets.push_back(newWidget);
        //        break;
        //    case WidgetType::ssToggleButton:
        //        newWidget = new ssToggleButton(m_newPanel, m_ID, wxString("Name"), wxDefaultPosition, wxDefaultSize, wxNO_BORDER);
        //        widgets.push_back(newWidget);
        //        break;
        //    case WidgetType::ssCollapsibleButton:
        //        newWidget = new ssCollapsibleButton(m_newPanel, m_ID, wxString("Name"), wxDefaultPosition, wxDefaultSize, wxNO_BORDER);
        //        widgets.push_back(newWidget);
        //        break;
        //    case WidgetType::ssCheckBox:
        //        newWidget = new ssCheckBox(m_newPanel, m_ID, wxString("Name"), wxDefaultPosition, wxDefaultSize, wxNO_BORDER);
        //        widgets.push_back(newWidget);
        //        break;
        //    case WidgetType::ssButton:
        //        newWidget = new ssButton(m_newPanel, m_ID, wxString("Name"), wxDefaultPosition, wxDefaultSize, wxNO_BORDER);
        //        widgets.push_back(newWidget);
        //        break;
    case WidgetType::ssTextCtrl:
        newWidget = new wxTextCtrl(m_newPanel, m_ID, wxString(""), wxDefaultPosition, wxSize(-1, 36), wxTE_PROCESS_ENTER, use_validator);
        m_widgets.push_back(newWidget);
        break;
    case WidgetType::wxButton:
        newWidget = new wxButton(m_newPanel, m_ID, "", wxDefaultPosition, wxSize(-1, 36));
        m_widgets.push_back(newWidget);
        break;
    case WidgetType::wxTextCtrl:
        newWidget = new wxTextCtrl(m_newPanel, m_ID, wxString(""), wxDefaultPosition, wxSize(-1, 36), wxTE_PROCESS_ENTER);
        m_widgets.push_back(newWidget);
        break;
    case WidgetType::wxStaticText:
        newWidget = new wxStaticText(m_newPanel, m_ID, wxString(""), wxDefaultPosition, wxDefaultSize);
        m_widgets.push_back(newWidget);
        break;
    case WidgetType::wxComboBox:
        newWidget = new wxComboBox(m_newPanel, m_ID, wxString(""), wxDefaultPosition, wxDefaultSize, 0, nullptr, wxCB_DROPDOWN);
        m_widgets.push_back(newWidget);
        break;
    case WidgetType::wxSpinCtrl:
        newWidget = new wxSpinCtrl(m_newPanel, m_ID, "0", wxDefaultPosition, wxDefaultSize);
        m_widgets.push_back(newWidget);
        break;
    case WidgetType::wxSpinCtrlDouble:
        newWidget = new wxSpinCtrlDouble(m_newPanel, m_ID, "0", wxDefaultPosition, wxDefaultSize);
        m_widgets.push_back(newWidget);
        break;
    case WidgetType::wxTimePicker:
        newWidget = new wxTimePickerCtrl(m_newPanel, m_ID);
        m_widgets.push_back(newWidget);
        break;
    case WidgetType::wxDatePicker:
        newWidget = new wxDatePickerCtrl(m_newPanel, m_ID);
        m_widgets.push_back(newWidget);
        break;
    default:
        // Обработка для неизвестного типа виджета
        break;
    }

    if (newWidget)
    {
        newWidget->Bind(wxEVT_LEFT_DOWN, &CostumScrollWindow::OnLeftDown, this);
        newWidget->Bind(wxEVT_LEFT_UP, &CostumScrollWindow::OnLeftUp, this);
        newWidget->Bind(wxEVT_MOTION, &CostumScrollWindow::OnMotion, this);
        newWidget->Bind(wxEVT_MOUSE_CAPTURE_LOST, &CostumScrollWindow::OnMouseCaptureLost, this);
        newWidget->Bind(wxEVT_SET_FOCUS, std::bind(&CostumScrollWindow::OnFocusGained, this, std::placeholders::_1));
        newWidget->Bind(wxEVT_KILL_FOCUS, std::bind(&CostumScrollWindow::OnFocusLost, this, std::placeholders::_1));

        switch (WidgetDesc.widget_type)
        {
        case WidgetType::ssRadio:
            newWidget->Bind(wxEVT_RADIOBUTTON, std::bind
                (&CostumScrollWindow::OnUniEventHandler<wxCommandEvent, MyActionType::TextChanged>, this, std::placeholders::_1));
            break;
            //    case WidgetType::ssChoice:
            //        break;
            //    case WidgetType::ssSwitch:
            //        break;
            //    case WidgetType::ssStaticText:
            //        break;
            //    case WidgetType::ssToggleButton:
            //        break;
            //    case WidgetType::ssCollapsibleButton:
            //        break;
            //    case WidgetType::ssCheckBox:
            //        break;
            //    case WidgetType::ssButton:
            //        break;
        case WidgetType::wxTextCtrl:
            [[fallthrough]];
        case WidgetType::ssTextCtrl:
            newWidget->Bind(wxEVT_TEXT, std::bind
                (&CostumScrollWindow::OnUniEventHandler<wxCommandEvent, MyActionType::TextChanged>, this, std::placeholders::_1));
            newWidget->Bind(wxEVT_TEXT_ENTER, std::bind
                (&CostumScrollWindow::OnUniEventHandler<wxCommandEvent, MyActionType::EnterPressed>, this, std::placeholders::_1));
            break;
        case WidgetType::wxButton:
            break;
        case WidgetType::wxComboBox:
            newWidget->Bind(wxEVT_COMBOBOX, std::bind
                (&CostumScrollWindow::OnUniEventHandler<wxCommandEvent, MyActionType::TextChanged>, this, std::placeholders::_1));
            /*
            newWidget->Bind(wxEVT_TEXT, std::bind
                (&CostumScrollWindow::OnUniEventHandler<wxCommandEvent, MyActionType::TextChanged>, this, std::placeholders::_1));
            newWidget->Bind(wxEVT_TEXT_ENTER, std::bind
                (&CostumScrollWindow::OnUniEventHandler<wxCommandEvent, MyActionType::EnterPressed>, this, std::placeholders::_1));
            */
            break;
        case WidgetType::wxSpinCtrl:
            newWidget->Bind(wxEVT_SPINCTRL, std::bind
                (&CostumScrollWindow::OnUniEventHandler<wxSpinEvent, MyActionType::TextChanged>, this, std::placeholders::_1));
            break;
        case WidgetType::wxSpinCtrlDouble:
            newWidget->Bind(wxEVT_SPINCTRLDOUBLE, std::bind
                (&CostumScrollWindow::OnUniEventHandler<wxSpinDoubleEvent, MyActionType::TextChanged>, this, std::placeholders::_1));
            break;
        case WidgetType::wxTimePicker:
            newWidget->Bind(wxEVT_TIME_CHANGED, std::bind
                (&CostumScrollWindow::OnUniEventHandler<wxDateEvent, MyActionType::TextChanged>, this, std::placeholders::_1));
            break;
        case WidgetType::wxDatePicker:
            newWidget->Bind(wxEVT_DATE_CHANGED, std::bind
                (&CostumScrollWindow::OnUniEventHandler<wxDateEvent, MyActionType::TextChanged>, this, std::placeholders::_1));
            break;
        };

        m_newRowSizer->Add(newWidget, WidgetDesc.proportion, wxEXPAND | wxALL, 2);
        //m_newRowSizer->Layout();
    }
    Thaw();
    return m_newRowSizer;

}

void CostumScrollWindow::DeleteRows()
{
    // Очистка и удаление объектов из вектора m_widgets, если он не пуст
    if (!m_widgets.empty())
    {
        for (size_t i = 0; i < m_widgets.size(); ++i)
            delete m_widgets[i];
        m_widgets.clear();
    }

    // Очистка и удаление объектов из вектора m_staticTextVector, если он не пуст
    if (!m_staticTextVector.empty())
    {
        for (size_t i = 0; i < m_staticTextVector.size(); ++i)
            delete m_staticTextVector[i];
        m_staticTextVector.clear();
    }

    // Очистка и удаление объектов из вектора m_vectorButtons, если он не пуст
    if (!m_vectorButtons.empty())
    {
        for (size_t i = 0; i < m_vectorButtons.size(); ++i)
            delete m_vectorButtons[i];
        m_vectorButtons.clear();
    }

    // Очистка и удаление объектов из вектора m_vectorDelButtons, если он не пуст
    if (!m_vectorDelButtons.empty())
    {
        for (size_t i = 0; i < m_vectorDelButtons.size(); ++i)
            delete m_vectorDelButtons[i];
        m_vectorDelButtons.clear();
    }

    // Очистка и удаление объектов из вектора m_panelVector, если он не пуст
    if (!m_panelVector.empty())
    {
        for (size_t i = 0; i < m_panelVector.size(); ++i)
        {
            wxPanel* panel = m_panelVector[i];
            // Удаление дочерних объектов, если такие есть
            // Например, если внутри панели есть виджеты, их нужно удалить
            for (size_t j = 0; j < panel->GetChildren().GetCount(); ++j)
            {
                wxWindow* child = panel->GetChildren().Item(j)->GetData();
                if (child)
                    delete child;
            }
            // Удаление самой панели
            delete panel;
        }
        m_panelVector.clear();
    }

    // Очистка и удаление объектов из вектора m_MainpanelVector, если он не пуст
    if (m_MainpanelVector.size() != 0)
    {

        for (size_t i = 0; i < m_MainpanelVector.size(); ++i)
        {
            wxPanel* panel = m_MainpanelVector[i];
            // Удаление дочерних объектов, если такие есть
            // Например, если внутри панели есть виджеты, их нужно удалить
            for (size_t j = 0; j < panel->GetChildren().GetCount(); ++j)
            {
                wxWindow* child = panel->GetChildren().Item(j)->GetData();
                if (child)
                {
                    delete child;
                    DeleteRowNum();
                }
            }
            // Удаление самой панели
            delete panel;
        }
        m_MainpanelVector.clear();
    }
}

//функция возвращающая количество строк
int CostumScrollWindow::GetRowCount()
{
    return row + 1;
}

//функция поиска номера виджета в сайзере
int CostumScrollWindow::FindItemIndex(wxSizer* sizer, wxWindow* window)
{
    int itemCount = sizer->GetItemCount();
    for (int i = 0; i < itemCount; i++)
    {
        wxSizerItem* item = sizer->GetItem(i);
        if (item && item->GetWindow() == window)
        {
            return i;
        }
    }
    return -1; // Если элемент не найден
}


void CostumScrollWindow::OnMouseCaptureLost(wxMouseCaptureLostEvent& event)
{
    if (m_goButton)
    {
        m_goButton = nullptr;
    }
}

//функция перемещения мышки
void CostumScrollWindow::OnMotion(wxMouseEvent& event)
{

    if (leftDownFlag == true) {
        SetColor(m_draggedWidget);
    }
    move1 = move1 + 1;
}

//функция нахождения нового индекса после перемещения
int CostumScrollWindow::CalculateNewIndex(const wxPoint& currentPosition)
{
    int itemCount = m_contentSizer->GetItemCount();
    int newIndex = -1; // Индекс местоположения для вставки перемещаемой кнопки

    double closestButtonDistance = DBL_MAX; // Расстояние до ближайшей кнопки

    double weightDistanceToCenter = 0.5; // Вес расстояния до центра кнопки
    double weightDistanceToEdge = 0.2;   // Вес расстояния от верхнего края кнопки
    double weightMousePosition = 0.3;    // Вес положения мыши относительно кнопки

    for (int i = 0; i < itemCount; i++)
    {
        wxSizerItem* item = m_contentSizer->GetItem(i);
        wxWindow* window = item->GetWindow();

        if (window && window != m_goButton) // Исключаем текущую перемещаемую кнопку
        {
            wxRect buttonRect = window->GetRect();

            // Получаем центр текущей кнопки
            double buttonCenterY = buttonRect.GetTop() + buttonRect.GetHeight() / 2;

            // Рассчитываем расстояние до центра кнопки
            double distanceToCenter = abs(currentPosition.y - buttonCenterY);

            // Рассчитываем расстояние от верхнего края кнопки
            double distanceToEdge = abs(currentPosition.y - buttonRect.GetTop());

            // Определяем положение мыши относительно кнопки
            double mousePosition = 1.0 - (distanceToEdge / buttonRect.GetHeight());

            // Смешиваем веса расстояния до центра и верхнего края
            double combinedDistance = weightDistanceToCenter * distanceToCenter + weightDistanceToEdge * distanceToEdge;

            // Учитываем положение мыши
            combinedDistance += weightMousePosition * mousePosition;

            if (combinedDistance < closestButtonDistance)
            {
                closestButtonDistance = combinedDistance;
                newIndex = i;
            }
        }
    }

    return newIndex;
}

//функция событияотпускания мыши также тут обработка перемещения виджета
void CostumScrollWindow::OnLeftUp(wxMouseEvent& event)
{
    if (GetColum() > 0) {
        int buttonId = event.GetId();
        if (leftDownFlag)
        {
            // Получаем текущее положение мыши
            wxPoint screenPosition = wxGetMousePosition();
            wxPoint windowPosition = ScreenToClient(screenPosition);

            currentIndex = FindItemIndex(m_contentSizer, draggingPanel);
            m_newIndex = CalculateNewIndex(windowPosition);

            if (currentIndex != -1 && m_newIndex != -1 && currentIndex != m_newIndex)
            {

                for (size_t i = 0; i < m_widgets.size(); i++) {
                    wxWindow* widget = m_widgets[i];


                    // Проверяем, является ли widget равным nullptr
                    if (widget == nullptr) {
                        continue; // Пропускаем null-виджет и переходим к следующему
                    }

                    if (widget->GetId() == buttonId) {
                        // Объект с заданным ID найден, сохраняем его индекс в DeleteRow и выходим из цикла
                        m_row = i;
                        //                    break;
                    }
                }

                bool isApproved = GenerateMoveRowFirst();

                if (!isApproved) {
                    wxLogDebug("Operation rejected.");
                    UpdateUI();
                    draggingPanel = nullptr;
                    leftDownFlag = false;
                    return; // Прервать выполнение операции
                }

                MovePanelToNewIndex(draggingPanel, currentIndex, m_newIndex);
                GenerateMoveRowSecond();
            }
            else
            {
                event.Skip();
            }
        }
    }
    UpdateUI();
    leftDownFlag = false;
    draggingPanel = nullptr;
    FitInside();
}

//функция обновления цвета после перемещения
void CostumScrollWindow::UpdateUI()
{
    for (wxWindow* widget : m_widgets) {
        if (!widget)
            continue; // Пропустить нулевые указатели

        if (widget->GetId() == m_IDwasClicked) {
            if (ssTextCtrl* textctrl = dynamic_cast<ssTextCtrl*>(widget)) {
                // Это ssTextCtrl
               // textctrl->SetBackgroundColour(wxColor(255, 255, 255));
                wxColour textctrlpen = textctrl->GetBorderColour(ssTextCtrl::State::Default);
                if (textctrlpen == wxColor(255, 255, 255)) {
                    // textctrl->SetBorderColour(wxColor(206, 206, 206));
                }
                textctrl->Refresh();
            }
            else {
                // Не ssTextCtrl, меняем цвет
               // widget->SetBackgroundColour(wxNullColour);
                widget->Refresh();
            }
        }
    }

    for (wxWindow* widget : m_panelVector) {
        if (!widget)
            continue; // Пропустить нулевые указатели

        if (widget->GetId() == m_IDwasClicked) {
            if (wxPanel* Panel = wxDynamicCast(widget, wxPanel)) {
                widget->SetWindowStyleFlag(widget->GetWindowStyleFlag() & ~wxBORDER_THEME);
                widget->SetBackgroundColour(wxNullColour);
                widget->Refresh();
            }
        }
    }

    for (ssButton* button : m_vectorButtons) {
        if (button && button->GetId() == m_IDwasClicked) {
            button->SetBackgroundColour(wxColour(255, 255, 255));
        }
    }

    m_IDwasClicked = -1;

}

//функция поиска панельки по ID
wxPanel* CostumScrollWindow::FindPanelByID(int id)
{
    for (wxPanel* panel : m_MainpanelVector)
    {
        if (panel->GetId() == id)
        {
            return panel;
        }
    }
    return nullptr;
}

//функция перемещения панельки
void CostumScrollWindow::MovePanelToNewIndex(wxPanel* panel, int currentIndex, int newIndex)
{

    if (currentIndex < 0 || newIndex < 0 || currentIndex >= m_contentSizer->GetItemCount() || newIndex >= m_contentSizer->GetItemCount()) {
        return; // Проверка на корректные индексы
    }

    m_contentSizer->Detach(panel);
    m_contentSizer->Insert(newIndex, panel, wxSizerFlags(0).Border(wxALL, 0).Expand());
    m_contentSizer->Layout();
    m_contentSizer->GetContainingWindow()->FitInside();
    //m_newPanel->Layout();
    UpdateRowNumbers();

    std::vector<wxWindow*> newWidgets;

    wxSizerItemList items = m_contentSizer->GetChildren();

    for (wxSizerItemList::const_iterator it = items.begin(); it != items.end(); ++it) {
        wxSizerItem* item = *it;
        wxWindow* widget = item->GetWindow();

        if (widget) {
            wxWindowID id = widget->GetId();

            // Создайте временный вектор для виджетов текущей группы
            std::vector<wxWindow*> currentGroup;

            // Найдите все виджеты текущей группы в текущем векторе m_widgets по ID
            for (size_t i = 0; i < m_widgets.size(); ++i) {

                wxWindow* widget = m_widgets[i];

                // Проверяем, является ли widget равным nullptr
                if (widget == nullptr) {
                    continue; // Пропускаем null-виджет и переходим к следующему
                }

                if (widget->GetId() == id) {

                    currentGroup.push_back(widget);
                }
            }

            newWidgets.insert(newWidgets.end(), currentGroup.begin(), currentGroup.end());
        }
    }


    m_widgets = newWidgets;

    std::vector<wxPanel*> newMainPanelVector;



    for (wxSizerItemList::const_iterator it = items.begin(); it != items.end(); ++it) {
        wxSizerItem* item = *it;
        wxWindow* widget = item->GetWindow();

        if (widget && dynamic_cast<wxPanel*>(widget) != nullptr) {
            newMainPanelVector.push_back(static_cast<wxPanel*>(widget));
        }
    }

    m_MainpanelVector = newMainPanelVector;


}

//функция добавлени колонки с нумерацией
void CostumScrollWindow::ChangeRowOrder(int proportion)
{
    m_changeOrder = true;
    m_changeOrderpropor = proportion;

}

void CostumScrollWindow::UpdateRowNumbers() {
    std::unordered_map<int, int> idToIndexMap;
    // Создаем отображение между staticTextID и индексом элемента в m_contentSizer
    for (int j = 0; j < m_contentSizer->GetItemCount(); j++) {
        wxSizerItem* item = m_contentSizer->GetItem(j);

        if (item) {
            wxWindow* window = item->GetWindow();
            if (window) {
                idToIndexMap[window->GetId()] = j;
            }
        }
    }
    // Обновляем номера элементов в m_staticTextVector
    for (int i = 0; i < m_staticTextVector.size(); i++) {
        wxStaticText* staticText = m_staticTextVector[i];
        int staticTextID = staticText->GetId();

        // Поиск индекса элемента в m_contentSizer по ID в отображении
        auto it = idToIndexMap.find(staticTextID);
        if (it != idToIndexMap.end()) {
            int index = it->second;
            staticText->SetLabel(wxString::Format("%d", index + 1));
        }
    }
}



//функция обработки нажатия на кнопку активации
void CostumScrollWindow::OnMouseEnter(wxMouseEvent& event) {
    int clickedID = event.GetId();
    for (wxWindow* widget : m_panelVector) {
        if (widget && widget->GetId() == clickedID) {
            // Проверяем, является ли виджет объектом ssButton
            wxPanel* panel = dynamic_cast<wxPanel*>(widget);
            if (panel) {
                //         wxLogDebug("hiii panel");
                //        wxClientDC dc(panel);
                //         panel->SetBackgroundColour(wxColor(0,0,0,0));
                //        wxRect rect = panel->GetClientRect();
                //        dc.SetPen(wxPen(wxColor(0,0,0), 2)); // Толщина линии и цвет обводки
                ////        dc.SetBrush(*wxTRANSPARENT_BRUSH);
                //        dc.DrawRectangle(rect);
                // panel->Refresh();

            }

            for (ssButton* button : m_vectorButtons) {
                if (button && button->GetId() == clickedID) {
                    \
                        // Установка цвета кнопки в зависимости от состояния
                        button->SetBackgroundColour(wxColor(235, 237, 251));
                    m_wasHover = clickedID;
                }
            }
        }
    }
    Refresh();
}

//функция обработки потери фокуса кнопки активации
void CostumScrollWindow::OnMouseLeave(wxMouseEvent& event) {

    for (wxWindow* widget : m_panelVector) {
        if (widget && widget->GetId() == m_wasHover) {
            // Проверяем, является ли виджет объектом ssButton
            wxPanel* panel = dynamic_cast<wxPanel*>(widget);
            if (m_wasHover != m_IDwasClicked) {
                if (panel) {

                }
            }

            for (ssButton* button : m_vectorButtons) {
                if (button && button->GetId() == m_wasHover) {
                    UpdateUI();
                    button->SetBackgroundColour(wxColour(255, 255, 255));

                }
            }

        }

        Refresh();
        event.Skip();
    }
}

CostumScrollWindow::~CostumScrollWindow()
{

}

//функция события перемещения строчки
bool CostumScrollWindow::GenerateMoveRowFirst()
{
    wxLogDebug("hii");
    wxCommandEvent event(wxEVT_TABLEMOVINGROW, GetId());

    //    wxPoint coord = GetWigetCoord(m_row);
    ProcessWindowEvent(event);
    widgetInfo info;
    info.rowWas = currentIndex;

    info.rowNew = m_newIndex;
    info.eventType = MyActionType::MoveRowStart;

    void* data = static_cast<void*>(&info);
    event.SetClientData(data);
    GetParent()->ProcessWindowEvent(event);
    return event.GetInt() != 0;
}

void CostumScrollWindow::GenerateMoveRowSecond()
{
    wxCommandEvent event(wxEVT_TABLEMOVEDROW, GetId());

    wxPoint coord = GetWigetCoord(m_row);
    ProcessWindowEvent(event);
    widgetInfo info;
    info.rowWas = currentIndex;
    info.rowNew = m_newIndex;
    info.eventType = MyActionType::MoveRowEnd;

    void* data = static_cast<void*>(&info);
    event.SetClientData(data);
    GetParent()->ProcessWindowEvent(event);
}

void CostumScrollWindow::GenerateMoveRowStart(int id)
{
    wxCommandEvent event(wxEVT_TABLEMOVESTART, GetId());
    wxLogDebug("Move %d", id);
    //wxPoint coord = GetWigetCoord(m_row);
    ProcessWindowEvent(event);
    widgetInfo info;
    info.rowWas = id;
    wxLogDebug("Hello My");
    void* data = static_cast<void*>(&info);
    event.SetClientData(data);
    GetParent()->ProcessWindowEvent(event);
}

//функция события добавления строчки
bool CostumScrollWindow::GenerateAddNewRowEventStart() //создание события
{
    wxCommandEvent event(wxEVT_TABLEADDINGROW, GetId());
    ProcessWindowEvent(event);

    widgetInfo focusInfo;
    focusInfo.row = row + 1;
    focusInfo.eventType = MyActionType::AddRowStart;

    void* data = static_cast<void*>(&focusInfo);
    event.SetClientData(data);

    GetParent()->ProcessWindowEvent(event);
    return event.GetInt() != 0 ? true : false;
}



//функция события удаления строчки
bool CostumScrollWindow::GenerateDeleteRowFirst()
{
    wxCommandEvent event(wxEVT_TABLEDELLINGROW, GetId());

    wxPoint coord = GetWigetCoord(m_row);
    ProcessWindowEvent(event);
    widgetInfo info;
    info.row = coord.x;
    info.eventType = MyActionType::DeleteRowStart;

    void* data = static_cast<void*>(&info);
    event.SetClientData(data);
    GetParent()->ProcessWindowEvent(event);
    return event.GetInt() != 0;
}

//функция генерирующая событие добавления виджета (используется для раскраски)
void CostumScrollWindow::GenerateAddNewRowEvenEnd() //создание события
{
    wxCommandEvent event(wxEVT_TABLEADDEDROW, GetId());
    ProcessWindowEvent(event);

    widgetInfo focusInfo;
    focusInfo.row = row + 1;;
    focusInfo.eventType = MyActionType::AddRowEnd;

    void* data = static_cast<void*>(&focusInfo);
    event.SetClientData(data);

    GetParent()->ProcessWindowEvent(event);

}

void CostumScrollWindow::GenerateDeleteRowSecond()
{
    wxCommandEvent event(wxEVT_TABLEDELLEDROW, GetId());

    wxPoint coord = GetWigetCoord(m_row);
    ProcessWindowEvent(event);
    widgetInfo info;
    info.row = coord.x;
    info.eventType = MyActionType::DeleteRowEnd;

    void* data = static_cast<void*>(&info);
    event.SetClientData(data);
    GetParent()->ProcessWindowEvent(event);
}

void CostumScrollWindow::OnChildButtonClicked(wxCommandEvent& event) {
    // Получаем ID дочернего элемента, на котором произошло событие
    int childID = event.GetId();

    childID = FindPanelIndexByID(childID);
    wxObject* eventObject = event.GetEventObject();

    // Проверьте, является ли этот объект экземпляром wxWindow
    wxWindow* focusedWidget = wxDynamicCast(eventObject, wxWindow);

    int widgetIndex = -1;
    for (size_t i = 0; i < m_vectorButtons.size(); ++i) {
        if (m_vectorButtons[i] == focusedWidget) {
            widgetIndex = i;
            wxLogDebug("iiiii %zu", i);
            break;
        }
    }
    // wxPoint coordWidget = GetWigetCoord(widgetIndex);

    setLastRowNumber(childID);

}

widgetInfo CostumScrollWindow::ScanForWidget(wxObject* eventObject)
{ // Ищем в нашем хранилище m_widgets сведения об окне eventObject.
  // Проверим сначала, является ли этот объект экземпляром wxWindow. Если нет, получим отладочное исключение.
    wxWindow* focusedWidget = wxDynamicCast(eventObject, wxWindow);

    int widgetIndex = -1;
    for (size_t i = 0; i < m_widgets.size(); ++i)
    {
        if (m_widgets[i] == focusedWidget)
        {
            widgetIndex = i;
            break;
        }
    }
    wxPoint coordWidget = GetWigetCoord(widgetIndex);

    widgetInfo info;
    info.row = coordWidget.x;
    info.col = coordWidget.y;

    return info;
}

// Обработчик для получения фокуса в виджете
void  CostumScrollWindow::OnFocusGained(wxFocusEvent& event)
{
    // Получим информацию о виджете, который вызвал событие
    widgetInfo focusInfo = ScanForWidget(event.GetEventObject());
    focusInfo.eventType = MyActionType::FocusGained;
    wxCommandEvent customEvent(wxEVT_TABLEWIDGETS, GetId());
    int last_coord_widget_row = focusInfo.row;

    if (focusInfo.row < 0 || focusInfo.col < 0)
    {
        event.Skip();
        return;
    }

    void* data = static_cast<void*>(&focusInfo);

    customEvent.SetClientData(data);

    GetParent()->ProcessWindowEvent(customEvent);
    setLastRowNumber(last_coord_widget_row);
    event.Skip();
}

void CostumScrollWindow::OnFocusLost(wxFocusEvent& event)
{
    if (event.GetEventType() == wxEVT_KILL_FOCUS)
    {
        // Это событие потери фокуса, обрабатываем его здесь
        // Получим информацию о виджете, который вызвал событие
        widgetInfo focusInfo = ScanForWidget(event.GetEventObject());
        wxCommandEvent customEvent(wxEVT_TABLEWIDGETS, GetId());
        focusInfo.eventType = MyActionType::FocusLost;

        if (focusInfo.row < 0 || focusInfo.col < 0)
        {
            event.Skip();
            return;
        }

        void* data = static_cast<void*>(&focusInfo);
        customEvent.SetClientData(data);

        GetParent()->ProcessWindowEvent(customEvent);
    }
    event.StopPropagation();
    event.Skip();
}

//функция получения координат виджета из индекса
wxPoint  CostumScrollWindow::GetWigetCoord(int widgetIndex)
{

    if (widgetIndex != -1)
    {
        int row = widgetIndex / m_colum; // Найти номер строки
        int col = widgetIndex % m_colum;// Найти номер столбца
        return wxPoint(row, col);
    }
    else
    {
        // Виджет не найден по ID
        return wxPoint(-1, -1);
    }
}

int CostumScrollWindow::GetColum()
{
    return m_colum;
}


void CostumScrollWindow::onDeleteColum(std::vector<int> indexes, int col)
{
    if (std::find(m_delCol.begin(), m_delCol.end(), col) == m_delCol.end()) {
        // Если значения нет в векторе, добавляем его
        m_delCol.push_back(col);
        // Уменьшаем m_colum
        m_colum = m_colum - 1;
    }

    if (col < m_addedWidgetsType.size()) {
        m_addedWidgetsType.erase(m_addedWidgetsType.begin() + col);
    }
    else {

    }
    for (const int index : indexes) {
        if (index >= 0 && index < m_widgets.size()) {
            // Получаем указатель на удаляемый объект из вектора m_widgets
            wxWindow* widgetToRemove = m_widgets[index];

            // Проверяем, был ли объект создан с использованием new
            if (widgetToRemove) {
                // Заменяем элемент в векторе на nullptr
                m_widgets[index] = nullptr;

                // Удаляем объект
                delete widgetToRemove;
            }

        }
    }

    for (int i = indexes.size() - 1; i >= 0; --i) {
        int index = indexes[i];
        if (index >= 0 && index < m_widgets.size()) {

            m_widgets.erase(m_widgets.begin() + index);
        }
    }

    Refresh();
}

void CostumScrollWindow::OnSetVisible(int col, bool isVis) {
    
            std::vector<int> indexes;

    int m_rows = GetRowCount();
    int row = 0;
    if (col >= 0 && col <= m_colum)
    {
        for (row >= 0; row <= m_rows; row++) {
            int index = row * m_colum + col;
            indexes.push_back(index);
        }
    }
    for (int index : indexes) {
        if (index >= 0 && index < m_widgets.size()) {
            if(!isVis){
                auto it = std::find(m_notVisCol.begin(), m_notVisCol.end(), col);
                if (it == m_notVisCol.end()) {
                    m_notVisCol.push_back(col);
                }
            }
            else{
                 // Проверка наличия элемента в векторе
                auto it = std::find(m_notVisCol.begin(), m_notVisCol.end(), col);

                if (it != m_notVisCol.end()) {
                    m_notVisCol.erase(it);
                }

            }
            m_widgets[index]->Show(isVis);

        }
    }
}

void CostumScrollWindow::MoveRow(int oldRow, int newRow) {
    wxPanel* panel = FindPanelByIndex(oldRow);
    MovePanelToNewIndex(panel, oldRow, newRow);
    FitInside();
}

wxPanel* CostumScrollWindow::FindPanelByIndex(size_t index)
{
    if (index < m_MainpanelVector.size()) {
        return m_MainpanelVector[index];
    }
    return nullptr;
}

void CostumScrollWindow::DeleteRow(int rows) {
    int deleteButtonId = FindPanelIDByIndex(rows);

    // Создаем временный вектор для хранения виджетов для удаления
    std::vector<wxWindow*> widgetsToDelete;

    for (size_t i = 0; i < m_widgets.size(); i++) {
        wxWindow* widget = m_widgets[i];

        if (!widget) {
            continue; // Пропустить нулевые указатели
        }
        if (widget->GetId() == deleteButtonId) {
            widgetsToDelete.push_back(widget);
        }
    }

    for (auto it = m_staticTextVector.begin(); it != m_staticTextVector.end();) {
        wxStaticText* staticText = *it;


        if (staticText && staticText->GetId() == deleteButtonId) {
            // Удаляем элемент из вектора и освобождаем память
            delete staticText;
            it = m_staticTextVector.erase(it); // Переходите к следующему элементу
        }
        else {
            ++it; // Переходите к следующему элементу без удаления
        }
    }

    for (wxWindow* widget : widgetsToDelete) {

        if (!widget) {
            continue;
        }
        m_contentSizer->Detach(widget);
        delete widget;
        // Удалите виджет из вектора
        m_widgets.erase(std::remove(m_widgets.begin(), m_widgets.end(), widget), m_widgets.end());
    }

    for (auto it = m_vectorButtons.begin(); it != m_vectorButtons.end();) {
        ssButton* button = *it;

        if (button && button->GetId() == deleteButtonId) {
            // Удалить кнопку из вектора
            it = m_vectorButtons.erase(it);

            // Удалить кнопку из сайзера и освободить память
            m_contentSizer->Detach(button);
            button->Destroy();
        }
        else {
            ++it;
        }
    }

    //  wxLogDebug("After removing from m_vectorButtons: %zd buttons", m_vectorButtons.size());
    // Удаляем панели с тем же ID из m_panelVector и m_MainpanelVector
    for (size_t i = 0; i < m_panelVector.size(); i++) {
        wxPanel* panel = m_panelVector[i];
        if (!panel) {
            continue;
        }
        if (panel->GetId() == deleteButtonId) {
            panel->Destroy();
            // Удалите панель из вектора
            m_panelVector.erase(m_panelVector.begin() + i);
            i--; // Уменьшите счетчик, чтобы не пропустить следующую панель
        }
    }

    for (size_t i = 0; i < m_MainpanelVector.size(); i++) {
        wxPanel* mainPanel = m_MainpanelVector[i];
        if (!mainPanel) {
            continue;
        }
        if (mainPanel->GetId() == deleteButtonId) {
            mainPanel->Destroy();
            // Удалить главную панель из вектора
            m_MainpanelVector.erase(m_MainpanelVector.begin() + i);
            i--; // Уменьшить счетчик, чтобы не пропустить следующую главную панель
        }
    }

    UpdateRowNumbers();
    int no = GetRowCount();
    if (no != 2 && no != 1 && no != 0) {
        sizePanel.y = m_contentSizer->GetMinSize().y;

        FitInside();
        m_contentSizer->GetContainingWindow()->FitInside();

    }
    else {
        int currentScrollPos = GetScrollPos(wxVERTICAL);
        int currentScrollPos2 = GetScrollPos(wxHORIZONTAL);
        // Установите новое вертикальное положение прокрутки
        int newYPosition = currentScrollPos - 100; // сдвиг на 100 пикселей вниз
        Scroll(currentScrollPos2, newYPosition);
    }

    SetVirtualSize(sizePanel);
    m_contentSizer->Layout();

    //Fit();
    Refresh();
}

void CostumScrollWindow::DeleteRowNum() {
    row = row - 1;
}

wxWindowID CostumScrollWindow::FindPanelIDByIndex(size_t index)
{
    if (index < m_MainpanelVector.size()) {
        wxPanel* panel = m_MainpanelVector[index];
        return panel->GetId();
    }
    return wxID_NONE; // Возвращаем специальное значение, если индекс выходит за пределы вектора
}

int CostumScrollWindow::FindPanelIndexByID(int id)
{
    for (size_t index = 0; index < m_MainpanelVector.size(); ++index) {
        if (m_MainpanelVector[index]->GetId() == id) {
            return static_cast<int>(index);
        }
    }
    return -1; // Возвращаем -1, если панель с указанным ID не найдена
}

void CostumScrollWindow::SendScrollEvent(int scrollPosition) {
    wxCommandEvent event(UPDATE_HEADER_POSITION, GetId());
    event.SetInt(scrollPosition);
    ProcessWindowEvent(event);
}

void CostumScrollWindow::OnScrolll(wxScrollWinEvent& event) {
    int scrollPosition = GetScrollPos(wxHORIZONTAL); // Получите текущую позицию скролла
    SendScrollEvent(scrollPosition);
    event.Skip();
}

void CostumScrollWindow::RefreshLayout()
{
    Freeze();
    m_contentSizer->Layout();
    sizePanel.y = m_contentSizer->GetMinSize().y;

    FitInside();
    m_contentSizer->GetContainingWindow()->FitInside();
    Thaw();
}

void CostumScrollWindow::setLastRowNumber(int row) {
    lastUsedRow = row;
}

int CostumScrollWindow::getLastUsedRow() const
{
    return lastUsedRow;
}

void CostumScrollWindow::SetBackgroundColour(int col, int row) {
    // Создайте пару (pair) из значений col и row
    std::pair<int, int> colorPair(col, row);
    // Добавьте эту пару в вектор m_colorWidget
    m_colorWidget.push_back(colorPair);
}
