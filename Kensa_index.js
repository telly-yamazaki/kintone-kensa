//モバイル版は、backgroundColorも変更し、祝日色設定の部分もコメントアウト or 削除する。
//てすと

(function() {
  'use strict';
  kintone.events.on('app.record.index.show', function(event) {

    // カレンダー表示のときの設定
    if(event.viewType == "calendar") {

      // カレンダービューの表示時にフィールド値の条件に応じて、文字色、フィールドの背景色を変更する
  		var eles = document.getElementsByClassName("cellitem-value-gaia");  //PC版
  //		var eles = document.getElementsByClassName("gaia-mobile-v2-app-index-calendar-table-cell-body-list-item");  //モバイル版

      //タイトルの条件毎に色分け
  		for (var i = 0, il = eles.length; i < il; i++) {
  			var ele = eles[i];
  			ele.style.fontWeight = 'bold';
  //			ele.style.backgroundColor = 'plum'; //モバイル版のみ

  //検査の種類で色分け
        if(ele.textContent.indexOf("PCR") >= 0){
  				 ele.style.color = 'blue';
        }

  //ステータスで色分け
  			if (ele.textContent.indexOf("実施できなかった") >= 0 || ele.textContent.indexOf("拒否") >= 0) {
  				 ele.style.color = 'lightgray';
  			}else if(ele.textContent.indexOf("予定") >= 0){
  				 ele.style.color = 'red';
  			}else if(ele.textContent.indexOf("再アポ") >= 0){
  				 ele.style.color = 'orange';
  			}else if(ele.textContent.indexOf("コスト") >= 0){
  				 ele.style.color = 'black';
  			}else if(ele.textContent.indexOf("1回") >= 0){
  				 ele.style.color = 'lime';
  			}else if(ele.textContent.indexOf("2回") >= 0){
  				 ele.style.color = 'darkgreen';
  			}
  		}


//===↓↓↓モバイル版はここからコメントアウトor 削除せよ↓↓↓========
      // 土曜日を強調表示する
      document.querySelectorAll(".calendar-cell-gaia.sat-calendar-gaia,.calendar-weekday-sat-gaia").forEach(el=>{
          el.style.backgroundColor = "#eff9ff"
          el.style.color = "#bedeef";
      });
      // 日曜日を強調表示する
      document.querySelectorAll(".calendar-cell-gaia.sun-calendar-gaia,.calendar-weekday-sun-gaia").forEach(el=>{
          el.style.backgroundColor = "#fff0ea";
                  el.style.color = "#ef8a63";
      });

      // 祝日に名称追加と強調表示する
      document.querySelectorAll(".calendar-cell-gaia").forEach(el=>{
          var d = el.id.match(/\d{4}-\d{2}-\d{2}/)[0];
          var holidays = holiday_jp.between(new Date(d) ,new Date(d));
          if(holidays.length > 0){
              // 祝日の名称を追加する
              el.querySelector("span").innerText += ' ' + holidays[0].name;
              // 祝日を強調表示にする
              el.style.backgroundColor = "#fff0ea";
              el.style.color = "#ef8a63";
          }
      });
 //===↑↑↑　モバイル版はここまでコメントアウトor 削除せよ　↑↑↑========


    }


  });
})();
