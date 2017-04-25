OrderInformation = [];
MenuData = [];

var getUrl = window.location;
var baseurl = getUrl.protocol + "//" + getUrl.host + "/";
//baseurl = 'https://beta.portal.tacenergy.com/';

token = '';

//These Variables Control the Drawing and Style Modifications based on Width
useWideLocation = true; //Location Bar on the right
useWideLocationpx = 1000;
useWideMenu = true; //Menu Bar on the left
useWideMenupx = 1250;
//End Width Variables

var loginCompany = '';
var loginUser = '';


//Validated
function APICallGet(pathing, data, callback) {
    console.log("Calling API: " + pathing);
    $.ajax({
        type: "GET",
        url: baseurl + 'api/' + pathing,
        data: data,
        timeout: 3000,
        beforeSend: function (xhr) {
            if (token !== '') xhr.setRequestHeader('Authorization', token);
        },
        success: function (data) { APIParseReply(data, callback); },
        error: function (xhr, ajaxOptions, thrownError) { genericAjaxError(pathing, xhr, ajaxOptions, thrownError); }
    });
}
function APICallPost(pathing, data, callback) {
    $.ajax({
        type: "POST",
        url: baseurl + 'api/' + pathing,
        contentType: 'application/json',
        data: JSON.stringify(data),
        timeout: 3000,
        beforeSend: function (xhr) {
            if (token !== '') xhr.setRequestHeader('Authorization', token);
        },
        success: function (data) { APIParseReply(data, callback); },
        error: function (xhr, ajaxOptions, thrownError) { genericAjaxError(pathing, xhr, ajaxOptions, thrownError); }
    });
}
function APIParseReply(data, callback) {
    var ReceivedData = data;
    if (typeof data !== 'object') {
        try {
            ReceivedData = JSON.parse(data);
        } catch (e) {
            ShowErrorPopup('GENERAL ERROR', 'Unexpected Response From API: ' + data);
        }
    }

    if (ReceivedData.Status === 0) { //Everything Was good.
        if (callback) callback(ReceivedData);
        return;
    }

    if (ReceivedData.Status === 2) { //Login Required
        loadPanel('page_login');
        return true;
    }

    if (ReceivedData.Status === 3) { //Authorization Required
        ShowErrorPopup('SECURITY ERROR', 'You Are Not Authorized For This Module.');
        loadPanel('page_home');
        return true;
    }

    ShowErrorPopup('GENERAL ERROR', 'An Unexpected Error Has occurred On The Server.');
    if (callback) callback(null);
    return;


}
function ShowErrorPopup(title, message) {
    BootstrapDialog.alert({
        title: title,
        message: message,
        type: BootstrapDialog.TYPE_DANGER, // <-- Default value is BootstrapDialog.TYPE_PRIMARY
        closable: true, // <-- Default value is false
        draggable: true, // <-- Default value is false
    });
}
function genericAjaxError(whatiwasdoing, xhr, ajaxOptions, thrownError) {
    hideLoader();
    if (xhr.statusText === "timeout") {
        console.log("Connection Timeout");
        ShowErrorPopup('CONNECTION ERROR', 'Unable to contact website while ' + whatiwasdoing + '. Please check Internet Connection.');
    } else {
        console.log("Displaying Error");
        ShowErrorPopup('GENERAL ERROR', 'An Unexpected Error Has occurred while ' + whatiwasdoing + '. ' + xhr.responseText);
    }
}
function checkResponseForCommonErrors(ReceivedData) {
    return (ReceivedData === null); //This has been neutered because the functionality has been moved to the API area
}
function loginProcess() {
    var company = $("#txtCompany").val();
    var userid = $("#txtUser").val();
    var password = $("#txtPassword").val();
    var data = { "CompanyName": company, "UserName": userid, "Password": password }
    APICallPost('User/Login', data, LoginReply);
    return false; //Prevents form submission on the browser

    function LoginReply(data) {
        if (checkResponseForCommonErrors(data)) {
            //Error Occurred
            return;
        }
        token = data.newToken;
        sessionStorage.setItem('token', token);
        loginCompany = $("#txtCompany").val();
        loginUser = $("#txtUser").val();
        LoginComplete();
    }

    function LoginComplete() {
        if ((currentPanel === 'page_login') || (currentPanel === 'page_logout'))
            loadPanel('page_home');
        else
            loadPanel(currentPanel);
    }
}

//Menu Functionality
function UpdateMenu(callback) {
    APICallGet('User/Menu', {}, function (data) { MenuReply(data, callback); });

    function MenuReply(ReceivedData, callback) {
        if (ReceivedData === null) return;
        MenuData = ReceivedData.MenuItems;
        redrawMenu();
        if (callback) callback();
    }

    function redrawMenu() {
        if (!MenuData) return;
        myHtml = '';
        for (var i = 0; i < MenuData.length; i++) {
            myParent = MenuData[i];
            myHtml += '<h2><small>' + myParent.MenuName + '</small></h2><ul class="nav nav-pills nav-stacked">';
            for (var j = 0; j < myParent.Children.length; j++) {
                myHtml += '<li id="menu_' + myParent.Children[j].MenuPath + '"';
                if (currentPanel === myParent.Children[j].MenuPath)
                    myHtml += ' class="menu-item active"';
                myHtml += '><a onClick="loadPanel(\'' + myParent.Children[j].MenuPath + '\');">' + myParent.Children[j].MenuName + '</a></li>';
            }
            myHtml += '</ul>';
        }
        $("#leftbar-wrapper").html(myHtml); //Update the Locations Panel with the appropriate HTML

    }
}

//Begin Location Panel
LocationClick = function (LocationCell) { alert(LocationCell); };
function UpdateLocationData(callback) {
    APICallGet('User/AccountLocations/' + currentPanel, {}, function (data) { LocationDataReply(data, callback); });
}
function LocationDataReply(ReceivedData, callback) {
    if (checkResponseForCommonErrors(ReceivedData))
        return;
    AccountLocations = ReceivedData.Accounts;
    redrawLocations();
    if ($("#locations-link").data("account") === 0) {
        ClickLocation(AccountLocations[0].Locations[0], 1);
    } else {
        $("#lnk_" + $("#locations-link").data("account") + "_" + $("#locations-link").data("location")).trigger("click");
    }
    if (callback) callback();
}
function redrawLocations() {
    myHTML = '<form class="ui-filterable"><input id="location-filter" data-type="search"  placeholder="Search Locations..."></form>';
    myHTML += '<ul id="location-ul">';
    for (var i = 0; i < AccountLocations.length; i++) {
        myHTML += '<li class="location-header">' + AccountLocations[i].AccountName + '</li>';
        //ui-li-divider ui-bar-inherit ui-li-has-count
        for (var j = 0; j < AccountLocations[i].Locations.length; j++) {
            myLocation = AccountLocations[i].Locations[j];
            //This Creates new li with the needed information to quickly access this object again.	
            myHTML += '<li ';
            if (j + 1 === AccountLocations[i].Locations.length)
                myHTML += 'class="location-last" ';
            myHTML += 'data-acctindex="' + i.toString() + '-' + j.toString() + '" >';
            //This Creates the main content.
            myHTML += '<a class="locationItem" href="#"  id="lnk_' + myLocation.AccountNum.toString() + '_' + myLocation.LocationNum.toString() + '" data-locindex=' + j.toString() + ' data-acctindex=' + i.toString() + '><h3>' + myLocation.State + ' - ' + myLocation.City + '</h3><p>' + myLocation.ExtraAddr + '<BR>' + myLocation.Address + '</p>';
            //This adds the gallon indicator and closes the li. The gallon indicator is given an ID such as gal13764_1 so we can get to it later;
            myHTML += '<span class="ui-li-count ui-body-inherit" id="gal' + myLocation.AccountNum.toString() + '_' + myLocation.LocationNum.toString() + '">' + commafy(0) + '</span></a></li>';
        }
    }
    $("#locations-panel").html(myHTML); //Update the Locations Panel with the appropriate HTML
    $('#location-filter').fastLiveFilter('#location-ul', { callback: locationFilterCleanup });
    //location-filter
    $(".locationItem").click(function () {
        ClickLocation(AccountLocations[$(this).data('acctindex')].Locations[$(this).data('locindex')], $(this));
    });
}
function ClickLocation(myLocation, myLink) {
    myLI = $(myLink);

    //Update the Classes
    if ($('.tac-locations-active').length > 0)
        $('.tac-locations-active').removeClass('tac-locations-active');
    $(myLI).addClass('tac-locations-active');

    //Handle Location Button
    $('.tac-locations-link').html('<h3>' + myLocation.LocationName + '</h3><p>' + myLocation.ExtraAddr + ' / ' + myLocation.Address + '<BR>' + myLocation.City + ', ' + myLocation.State + '</p>');
    $('.tac-locations-link').data('account', myLocation.AccountNum);
    $('.tac-locations-link').data('location', myLocation.LocationNum);

    //Hide the Locations Panel if needed
    $("#locations-panel").addClass('tac-locations-hidden');

    //Run Page-Specific Function
    if (typeof locationChange === 'function') locationChange(myLocation, myLink)
    if (currentPanel === 'page_orders')
        UpdateOrderScreen(myLocation, myLink);
}

//Formatting
function locationFilterCleanup(total) {
    //$('li.location-detail').prevAll("li.location-header:first").show();
}
function commafy(num) {
    var parts = ('' + num).split("."), s = parts[0], i = L = s.length, o = '', c;
    while (i--) { o = (i === 0 ? '' : (L - i) % 3 ? '' : ',') + s.charAt(i) + o; }
    return o;
}

function filterLocations(searchText) {
    $('.tac-locations-panel ul > li').each(function () {
        var currentLiText = $(this).html(),
            showCurrentLi = currentLiText.indexOf(searchText) !== -1;
        $(this).toggle(showCurrentLi);
    });
}

//All of the logic to load new panels and process the configuration options
var currentPanel = '';
function showLoader(mytext) {
    $.blockUI({
        css: {
            border: 'none',
            padding: '15px',
            backgroundColor: '#000',
            '-webkit-border-radius': '10px',
            '-moz-border-radius': '10px',
            opacity: .5,
            color: '#fff'
        }, message: mytext
    });
}
function hideLoader() {
    $.unblockUI();
}
function loadPanel(pageHTML) {
    currentPanel = pageHTML;
    $('.menu-item.active').removeClass('active');
    sessionStorage.setItem('lastPanel', currentPanel);
    $.ajax({
        type: "GET",
        url: baseurl + 'app/' + pageHTML + '.html',
        data: {},
        success: function (data) { loadPanelReply(data); },
        error: function (xhr, ajaxOptions, thrownError) { reportAjaxError('Loading Panel: ' + pageHTML, xhr, ajaxOptions, thrownError); loadPanel('page_home'); }
    });
}
function loadPanelReply(myPage) {
    showLoader('Loading Information.');
    $("#content-panel").html(myPage);
    if ($("#page-config #config-title").html() !== '') {
        window.history.pushState("string", "TACEnergy Portal - " + $("#page-config #config-title").html(), "index.html?page=" + currentPanel);
        document.title = 'TACEnergy Portal - ' + $("#page-config #config-title").html();
    }

    if ($("#page-config #config-requirelogin").html() === '1') {
        if (token === '') {
            var oldPanel = currentPanel; //Store the current requested panel
            loadPanel('page_login');
            currentPanel = oldPanel; //Set the requested panel back to the prior setting.
            return;
        }
    }
    if (typeof runPage === 'function') runPage();
    handleMenuConfig();
}
function handleMenuConfig() {
    if ($("#page-config #config-show-menu").html() === '1') {
        UpdateMenu(handleLocationConfig);
        $("#wrapper").removeClass('suppress_menu');
    } else {
        $("#wrapper").addClass('suppress_menu');
        handleLocationConfig();
    }
}
function handleLocationConfig() {
    LocationSelected = function (myLocation, myLink) { }
    if ($("#page-config #config-show-wdms").html() === '2') {
        UpdateRightPanel('WDMS', hideLoader);
        $("#wrapper").removeClass('suppress_accountlocations');
    } else if ($("#page-config #config-show-wdms").html() === '1') {
        UpdateRightPanel('Accounts', hideLoader);
        $("#wrapper").removeClass('suppress_accountlocations');
    } else {
        $("#wrapper").addClass('suppress_accountlocations');
        hideLoader();
    }
}

function AccordionToggle(myLI) {
    //Have to process the first entry separately because it IS an order-section entry.
    $(myLI).toggleClass('active-section');
    $(myLI).toggleClass('last-section');
    myPrevLI = myLI;
    myLI = $(myLI).next();

    while ((myLI.length > 0) && (!$(myLI).hasClass('accordion-header'))) {
        $(myLI).toggleClass('active-section');
        $(myLI).removeClass('last-section');
        myPrevLI = myLI;
        myLI = $(myLI).next();
    };
    $(myPrevLI).addClass('last-section');
}
//End of panel loading logic

//Contact Information Display
function ContactTest() {
    contactItems = [{ "Name": "Supply and Logistics available 24/7", "Title": "Supply and Logistics", "Address": "100 Crescent Court, Suite 1600<br />Dallas, TX 75201", "tel": [{ "Location": "Office", "Number": "800-808-6500" }], "email": "orders@tacenergy.com" },
    { "Name": "Mark Cooper", "Title": "Supply and Logistics Manager", "Address": "100 Crescent Court, Suite 1600<br />Dallas, TX 75201", "tel": [{ "Location": "Office", "Number": "972-807-7900" }, { "Location": "Mobile", "Number": "9724892985" }], "email": "mcooper@tacenergy.com" },
    { "Name": "Fred Sloan", "Title": "TAC Energy Vice President and COO", "Address": "100 Crescent Court, Suite 1600<br />Dallas, TX 75201", "tel": [{ "Location": "Office", "Number": "9728077873" }], "email": "fsloan@tacenergy.com" },
    { "Name": "Joyce Stevens", "Title": "Fuel Payables and Tax Supervisor", "Address": "701 South Robison Road<br />Texarkana, TX 75501", "tel": [{ "Location": "Office", "Number": "800-235-5343" }], "email": "jstevens@tacenergy.com" },
    { "Name": "Tom Byrd", "Title": "Senior Credit Manager", "Address": "701 South Robison Road<br />Texarkana, TX 75501", "tel": [{ "Location": "Office", "Number": "800-235-5343" }, { "Location": "Mobile", "Number": "9032771005" }], "email": "tbyrd@tacenergy.com" },
    { "Name": "Shirley Allen", "Title": "Credit Assistant  (Contact for all credit and rebills)", "Address": "701 South Robison Road<br />Texarkana, TX 75501", "tel": [{ "Location": "Office", "Number": "800-235-5343" }], "email": "sallen@tacenergy.com" },
    { "Name": "Kat Hawkins", "Title": "Billing Supervisor", "Address": "701 South Robison Road<br />Texarkana, TX 75501", "tel": [{ "Location": "Office", "Number": "800-235-5343" }], "email": "khawkins@tacenergy.com" },
    { "Name": "Monica Phelps", "Title": "Billing Clerk", "Address": "701 South Robison Road<br />Texarkana, TX 75501", "tel": [{ "Location": "Office", "Number": "800-235-5343" }], "email": "mphelps@tacenergy.com" }
    ];
    PopupContactInfo(contactItems);
}
function ContactTestCheesie() {
    contactItems = [{ "Name": "Carl Nelson", "Title": "National Account Manager and Salesman", "Address": "7711 East 111th Street, Suite 105<br />Tulsa, OK 74133", "tel": [{ "Location": "Office", "Number": "9183949450" }, { "Location": "Mobile", "Number": "9186882268" }], "email": "cnelson@tacnergy.com" }];
    PopupContactInfo([{ "Name": "Paul Lovelace", "Title": "National Account Manager and Salesman", "Address": "7711 East 111th Street, Suite 105<br />Tulsa, OK 74133", "tel": [{ "Location": "Office", "Number": "9183949450" }, { "Location": "Mobile", "Number": "9186882268" }], "email": "cnelson@tacnergy.com" }]);
}
function ContactTestMatt() {
    contactItems = [{ "Name": "Matt Dozier", "Title": "Account Manager", "Address": "100 Crescent Court, Suite 1600<br />Dallas, TX 75201", "tel": [{ "Location": "Office", "Number": "9728077899" }, { "Location": "Mobile", "Number": "4694185328" }], "email": "mdozier@tacenergy.com" }];
    PopupContactInfo(contactItems);
}
function PopupContactInfo(contactList) {
    myHTML = '<div style=\'margin: 10px; line-height: 1.5em;\'><table>';
    if (contactList.length === 1) {
        myHTML += '<tr><td>' + DrawContactInfo(contactList[0]) + '</td></tr>';
    } else {
        for (var j = 0; j < contactList.length; j++) {
            if (j % 2 === 0)
                myHTML += '<tr><td>' + DrawContactInfo(contactList[j]) + '</td>';
            if (j % 2 === 1)
                myHTML += '<td>' + DrawContactInfo(contactList[j]) + '</td></tr>';
        }
    }
    myHTML += '</table></div>';
    $.blockUI({ onOverlayClick: $.unblockUI, message: myHTML });
}
function DrawContactInfo(contactInfo) {
    myHTML = '<fieldset class="contact-info"><legend>' + contactInfo.Title + '</legend>';
    myHTML += '<b>' + contactInfo.Name + '</b><br />';
    myHTML += contactInfo.Address + '<br />';
    for (var j = 0; j < contactInfo.tel.length; j++) {
        myHTML += contactInfo.tel[j].Location + ': <a href="tel:' + contactInfo.tel[j].Number + '">' + contactInfo.tel[j].Number + '</a><br />';
    }
    myHTML += 'Email: <a href="mailto:' + contactInfo.email + '">' + contactInfo.Name + '</a>';
    myHTML += '</fieldset>';
    return myHTML;
}
function endsWith(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}


//Password Change Functions
function ChangePassword() {
    var password = $("#txtPassword").val();
    var newpassword = $("#txtPasswordNew").val();
    var newpassword2 = $("#txtPasswordNew2").val();
    if (newpassword !== newpassword2) {
        alert("New passwords do not match!");
        return;
    }

    var data = { "CompanyName": loginCompany, "UserName": loginUser, "Password": password, "NewPassword": newpassword }
    APICallPost('User/ChangePassword', data, ChangeReply);
}
function ChangeReply(data) {
    if (checkResponseForCommonErrors(data)) {
        //Error Occurred
        return;
    }
    alert('Password Changed successfully.')
    loadPanel('page_home');
}


function VerfiyToken() {
    APICallGet('User/CheckToken', {}, VerifyToken_reply);
}
function VerifyToken_reply(data) {
    if (checkResponseForCommonErrors(data)) return;
    if ((currentPanel === 'page_login') || (currentPanel === 'page_logout'))
        loadPanel('page_home');
    else
        loadPanel(currentPanel);
}


function formatDateTime(sDate) {
    var date = new Date(sDate);
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    hours = hours < 10 ? '0' + hours : hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    seconds = seconds < 10 ? '0' + seconds : seconds;
    var strTime = hours + ':' + minutes + ':' + seconds;
    var strDate = date.getUTCMonth() + 1 + "/" + date.getUTCDate() + "/" + date.getUTCFullYear() + " " + strTime;
    return strDate;
}

function formatDate(sDate) {
    var date = new Date(sDate);
    var strDate = date.getUTCMonth() + 1 + "/" + date.getUTCDate() + "/" + date.getUTCFullYear();
    return strDate;
}

function formatGridDate(sDate) {
    return '<td>' + formatDate(sDate) + '</td>';
}

function formatGridMoney2(snum) {
    return '<td>$' + commafy(snum.toFixed(2)) + '</td>';
}
function formatGridMoney6(snum) {
    return '<td>$' + snum.toFixed(6) + '</td>';
}