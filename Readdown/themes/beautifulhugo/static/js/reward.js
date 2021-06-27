function ZanShang(){
  this.popbg = $('.zs-modal-bg');
  this.popcon = $('.zs-modal-box');
  this.closeBtn = $('.zs-modal-box .close');
  this.zsbtn = $('.zs-modal-btns .btn');
  this.zsPay = $('.zs-modal-pay');
  this.zsBtns = $('.zs-modal-btns');
  this.zsFooter = $('.zs-modal-footer');
  var that = this;
  $('.show-zs').on('click',function(){
    //鐐瑰嚮璧炶祻鎸夐挳鍑虹幇寮圭獥
    that._show();
    that._init();
  })
}
ZanShang.prototype._hide = function(){
  this.popbg.hide();
  this.popcon.hide();
}
ZanShang.prototype._show = function(){
  this.popbg.show();
  this.popcon.show();
  this.zsBtns.show();
  this.zsFooter.show();
  this.zsPay.hide();
}
ZanShang.prototype._init = function(){
  var that = this;
  this.closeBtn.on('click',function(){
    that._hide();
  })
  this.popbg.on('click',function(){
    that._hide();
  })
  this.zsbtn.each(function(el){
    $(this).on('click',function(){
      var num = $(this).attr('data-num'); //鎸夐挳鐨勫搴旂殑鏁板瓧
      var type = 'wechat';
      // $('.zs-type:radio:checked').val();//浠樻鏂瑰紡
      //鏍规嵁涓嶅悓浠樻鏂瑰紡鍜岄€夋嫨瀵瑰簲鐨勬寜閽殑鏁板瓧鏉ョ敓鎴愬搴旂殑浜岀淮鐮佸浘鐗囷紝浣犲彲浠ヨ嚜瀹氫箟杩欎釜鍥剧墖鐨勮矾寰勶紝榛樿鏀惧湪褰撳墠images鐩綍涓�
      //鍋囧浣犻渶瑕佸姞涓€涓繙绋嬭矾寰勶紝姣斿鎴戠殑灏辨槸
      //var src = 'http://caibaojian.com/wp-content/themes/blue/images/pay/'+type+'-'+num+'.png';
      var src = '/img/'+type+'-'+num+'.png';
      var text = $(this).html();
      var payType=$('#pay-type'), payImage = $('#pay-image'),payText = $('#pay-text');
      if(type=='alipay'){
        payType.html('鏀粯瀹�');
      }else{
        payType.html('寰俊');
      }
      payImage.attr('src',src);
      payText.html(text);
      that.zsPay.show();
      that.zsBtns.hide();
      that.zsFooter.hide();

    })
  })
}
var zs = new ZanShang();