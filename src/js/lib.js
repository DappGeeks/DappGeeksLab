// 页面跳转
function changePage(divId) {
    if (App.contracts.DappGeeksToken == undefined) {
        prompt("请先部署合约");
        return;
    }
    $('.mainDiv').hide();
    $('#' + divId).show();
}

// 提示信息
function prompt(msg) {
    $('#promptDiv').prepend('<div class="alert alert-warning alert-dismissible" role="alert"><button type="button" class="close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>#msg</div>'
        .replace(/#msg/, msg));
    
    setTimeout(() => {
        $('#promptDiv').empty()
    }, 5000);
}