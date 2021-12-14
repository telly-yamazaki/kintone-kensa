//モバイル版は'gaia-argoui-app-menu-edit'のところを→'gaia-mobile-v2-app-record-showtoolbar-editrecord-border'に変更


(function($) {
  'use strict';
  
  let listModelist = [
    "検査リスト","カナ_list","入退院アプリID_list","入院日時_list","退院日時_list","年齢_list","性別_list","患者ID_list","検査日_list","検査追加日_list","氏名_list","病室_list","検査結果_list",
    "検査項目_一括","検査年","検査月","期間1","期間2","並び順"
    ];//一括処理モードのときの項目
  
  let singleModelist = [
    "タイトル","Status1","カナ検索","患者ID検索","ID_Cor","Name_Kanji_Cor","Name_Kana_Cor","Sex_Cor","Age_Cor2","InDay1","OutDay1","身長","体重","RoomNo_Cor","病名"
    ];
  let gairaiModelist = [
  "タイトル","Status1","カナ検索_外来用","患者ID検索_外来用","ID_Cor","Name_Kanji_Cor","Name_Kana_Cor","Sex_Cor","Age_Cor2"
  ];
  let hideList = ["meiboアプリID_Auto","meiboアプリID_Auto_患者IDサーチ","入退院アプリID_Auto","入退院アプリID_Auto_患者IDサーチ","Name_Kanji_Cor_Gairai","Name_Kana_Cor_Gairai","Sex_Cor_Gairai","ID_Cor_Gairai","Age_Cor2_Gairai","作成モード"];
  let arrayList = ["check_cost","アポの取り直し"];//配列(チェックボックスや複数選択)項目
  //予約枠アプリからGETするフィールドを指定
  let getYoyakuRec = [
    "$id","日付","項目","予約枠"
  ];  

  //条件によって表示項目を選択する部分はfunctionにする。
  function fieldShow(event){
    var record = event.record;
    var User = kintone.getLoginUser(); //ユーザー名の取得

    //操作禁止項目
    let disabelFields = ['タイトル','Status1'];
    disabelFields.forEach((item) =>{record[item].disabled = true;});
    //検査項目は一度選んだら編集不可にする(バグ防止のため)
    record.検査項目1.disabled = Boolean(record.検査項目1.value);
    
		//条件によって表示項目を選択
    var boolKekka = Boolean(record.検査結果.value === "陽性" || record.検査結果.value === "陰性");//結果が出た時
    var boolMijisshi = Boolean(record.検査結果.value === "実施できなかった");
    let boolKensa1 = Boolean(record.検査項目1.value === "コロナ_PCR検査" || record.検査項目1.value === "コロナ_抗原検査" || record.検査項目1.value === "インフルエンザ_抗原検査");//"検査結果"を使うもの
    let boolKensa2 = Boolean(record.検査項目1.value === "心電図" || record.検査項目1.value === "ABI" || record.検査項目1.value === "栄養指導");//"実施状況"を使うもの
    let boolIC = Boolean(record.検査項目1.value==="IC");//IC
    let boolJikoku = Boolean(((record.検査項目1.value==="外来診察" || record.検査項目1.value==="胃カメラ" || record.検査項目1.value==="大腸カメラ") && record.予約枠ID.value) || record.検査項目1.value==="栄養指導" || (record.検査項目1.value==="IC" && record.PCR2.value && !record.回診時.value));//時刻が必要な項目（IDのときは実施日を入れてから判断で、回診時なら非表示）
    let boolVaccine = Boolean(record.検査項目1.value === "コロナ_ワクチン1回目" || record.検査項目1.value === "コロナ_ワクチン2回目");
    let boolJisshi = Boolean(record.実施状況.value === "実施済");

		kintone.app.record.setFieldShown('検査項目1', Boolean(record.Name_Kanji_Cor.value));
		kintone.app.record.setFieldShown('PCR2', Boolean(record.検査項目1.value));
		kintone.app.record.setFieldShown('備考', Boolean(record.検査項目1.value));
		kintone.app.record.setFieldShown('開始時刻', boolJikoku); //時刻が必要な項目の時だけ表示
		kintone.app.record.setFieldShown('検査結果', boolKensa1);
		kintone.app.record.setFieldShown('実施状況', boolKensa2 || boolIC);
		kintone.app.record.setFieldShown('check_cost', (boolKekka || boolJisshi) && !boolIC); //ICはコスト取らないはず。
		kintone.app.record.setFieldShown('事由', boolIC);
		kintone.app.record.setFieldShown('事由_詳細', boolIC);
		kintone.app.record.setFieldShown('アポの取り直し', Boolean(record.実施状況.value === "電話が繋がらなかった"));

    //DOM操作, ICのときだけプルダウン用のスペースを表示
    if(record.検査項目1.value === "IC"){
		  $('.control-spacer-field-gaia').eq(0).show();
    }else{
      $('.control-spacer-field-gaia').eq(0).hide();
    }
    
		    //実施できなかったことをタイトルへ反映
    var valStatus = "";
    //結果も「実施できなかった」も入っていなければ、実施予定で結果待ち
    if((boolKensa1 && !record.検査結果.value) || ((boolKensa2 || boolIC) && !record.実施状況.value)){valStatus = "実施予定・結果待ち";}
    if(boolKensa1 && boolMijisshi){valStatus = "実施できなかった";}
    if(boolKensa2 && record.実施状況.value === "拒否"){valStatus = "拒否";}
    if(boolKensa2 && record.実施状況.value === "実施できなかった" ){valStatus = "実施できなかった";}
    if(record.実施状況.value === "電話が繋がらなかった" && record.アポの取り直し.value.length === 0){valStatus = "要：再アポ";}
    if(record.check_cost.value.length){valStatus = "コスト入力済";}
    if(boolVaccine){valStatus = "接種";}

    //タイトルを生成
    let valTitle = "";
    if(record.Name_Kanji_Cor.value){
      if(record.開始時刻.value){//時刻があるものはタイトルの冒頭に代入
        valTitle = record.開始時刻.value + " ";
      }
      valTitle = valTitle + record.Name_Kanji_Cor.value + ' [' + record.検査項目1.value +']';
      if(valStatus !==""){
        valTitle = valTitle + ' (' + valStatus + ')';
      }
      record.タイトル.value = valTitle;
    }
    record.Status1.value = valStatus;
    
    //項目がICで、Drが編集したときのみの設定
		if (record.検査項目1.value==="IC" && (User.name === "東　大里" || User.name === "東　忠里" || User.name === "片岡" || User.name === "山崎　照夫" || User.name === "松永　遊歩")){
      //ICのとき、医師だけが見える項目
		  kintone.app.record.setFieldShown('IC後フィードバック', true);
		  kintone.app.record.setFieldShown('ShijiDr', true);
//		  kintone.app.record.setFieldShown('実施状況', true);
      //"担当した医師(ShijiDr)"にユーザー名を代入(ただし、既に代入されていたらそのまま)
      if(event.record.ShijiDr.value.length === 0){
        event.record.ShijiDr.value = [{code: User.code}];
      }
		}
		
    return event;
  }

//fieldshow設定を行う各種changeイベントハンドラ
  let events = [
//    'app.record.edit.show',
    'app.record.create.submit',
    'app.record.edit.submit',
    'app.record.index.edit.show',
    'app.record.index.edit.submit',
  	'app.record.create.change.Name_Kanji_Cor',
//  	'app.record.create.change.カナ検索',//ルックアップフィールドはchangeの対象外
  	'app.record.create.change.検査項目1',
  	'app.record.create.change.検査項目_一括',
  	'app.record.create.change.実施状況',
  	'app.record.create.change.PCR2',
  	'app.record.create.change.検査結果',
  	'app.record.create.change.check_cost',
  	'app.record.create.change.アポの取り直し',
  	'app.record.create.change.予約枠ID',
  	'app.record.edit.change.Name_Kanji_Cor',
  	'app.record.edit.change.検査項目1',
  	'app.record.edit.change.検査項目_一括',
  	'app.record.edit.change.実施状況',
  	'app.record.edit.change.PCR2',
  	'app.record.edit.change.検査結果',
  	'app.record.edit.change.check_cost',
  	'app.record.edit.change.アポの取り直し',
  	'app.record.edit.change.予約枠ID'
  ];
  kintone.events.on(events, fieldShow); 
/*{
    fieldShow(event);
    return event;
  });
*/  

  //detailモードでは、単発か一括かで表示を変える
  kintone.events.on('app.record.detail.show', function(event) {
    let record = event.record;
    //一括モードのデータは編集ボタンを押せないようにする。
    if(record.作成モード.value === '一括作成 (ノルマ確認)'){
     document.getElementsByClassName('gaia-argoui-app-menu-edit')[0].style.display = 'none'; //PC版
//    document.getElementsByClassName('gaia-mobile-v2-app-record-showtoolbar-editrecord-border')[0].style.display = 'none'; //モバイル版
    }    
    
    //値のあるものだけ表示(配列はlengthをつけてベット消去)
    for ( var item in record ) {kintone.app.record.setFieldShown(item, Boolean(record[item].value));}
    arrayList.forEach((item,i)=>{kintone.app.record.setFieldShown(item, Boolean(record[item].value.length));});

    //その他非表示項目
    hideList.forEach((item,i)=>{kintone.app.record.setFieldShown(item,false);});

    //単体モードならリストも非表示
    if(record.作成モード.value === 'レコードを1つ作成' || !record.作成モード.value || record.作成モード.value ==="外来患者レコードを作成(栄養指導)"){
      kintone.app.record.setFieldShown('検査リスト', false);
    }
    


  });
  
  //新規作成時は、単発か一括かの選択肢だけ表示
  kintone.events.on('app.record.create.show', function(event) {
    let record = event.record;
    //全てのレコードを一旦消去して作成モードのみ表示
    for ( var item in record ) {
      kintone.app.record.setFieldShown(item, false);
//        console.log(item);
     }
    kintone.app.record.setFieldShown('作成モード', true);

    record.カナ検索.lookup = true;//ルックアップの自動取得
    if(record.カナ検索.value){
      record.作成モード.value = "レコードを1つ作成";
  		kintone.app.record.setFieldShown('検査項目1', true);
    }//create.showの段階でカナ検索に値がある時は、入退院アプリからアクションで作成される場合。このとき、必ず単品モードであり、自動ルックアップされるはずなので、次の項目も見せる。

    //操作禁止項目
    let disabelFields = [
      'タイトル','Status1','回診時'
        ];
    disabelFields.forEach((item) =>{
      record[item].disabled = true;      
    });

    return event;
  });

  //作成モードが変更になったら、それぞれのモードに入る
  kintone.events.on('app.record.create.change.作成モード', function(event) {
    let record = event.record;
    //値があるときだけ発動する。
    if(record.作成モード.value){
      if(record.作成モード.value.indexOf('一括') > -1){
      //一括モード
        console.log('一括モード');
        kintone.app.record.setFieldShown('並び順', true);

      }else if(record.作成モード.value.indexOf('外来') > -1){
        //表示項目
        gairaiModelist.forEach((item,i)=>{
          kintone.app.record.setFieldShown(item, true);
        });
      }else{
      //単品モード
        console.log('単品モード');
        //表示項目
        singleModelist.forEach((item,i)=>{
          kintone.app.record.setFieldShown(item, true);
        });

      }
    }
    //選択したら選択ボタンをdisableにする
//    kintone.app.record.setFieldShown('作成モード', false);
      record.作成モード.disabled = true;  

    return event;
  });

  //一括モードで並び順を選択したらGET
  kintone.events.on('app.record.create.change.並び順', function(event) {
    let record = event.record;
    let narabi = '';//並び順用の変数

    //値があるときだけ発動する。
    if(record.並び順.value){
      switch(record.並び順.value){
        case '患者名順':
          narabi = 'Name_Kana_Cor';
          break;
        case '入院日時順':
          narabi = 'InDay1';
          break;
        case '病室順':
          narabi = 'RoomNo_Cor';
          break;
      }
        //検査項目とリストだけ表示する。
        kintone.app.record.setFieldShown('検査項目_一括', true);
        kintone.app.record.setFieldShown('検査リスト', true);


        let disableList = [
          "カナ_list","入退院アプリID_list","入院日時_list","退院日時_list","年齢_list","性別_list","患者ID_list","氏名_list","病室_list","検査日_list","検査結果_list"
            ];
        
        //GETするフィールドを指定
        let getRec = [
        "$id","Name_Kana_Cor","Sex_Cor","ステータス","ID_Cor","Name_Kanji_Cor","Age_Cor2","RoomNo_Cor","InDay1","OutDay1"
        ];    
        
        //====入退院アプリから記録をGETする。====
        var params = {
          'app':50,
          'query': 'ステータス in ("入院 (入院決定)") order by ' + narabi + ' asc',
//          'query': 'ステータス in ("入院 (入院決定)") order by Name_Kana_Cor asc',
          'fields': getRec
        };
    
        kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', params, function(resp){
          var record = kintone.app.record.get();
          console.log("respの中身:",resp);
    
          //===値を代入していく（検査日は空白）========
          resp.records.forEach((item, i) => {
      //      KanjaList = resp.records[i].$id.value; //ここはitemと書いても入ってくれないし[]で囲む形でないとだめ。
      
            record.record.検査リスト.value.push({
              value:{
                "入退院アプリID_list": {
                  value: resp.records[i].$id.value,
                  type: "NUMBER"
                },
                "入院日時_list": {
                  value: resp.records[i].InDay1.value,
                  type: "DATETIME"
                },
                "退院日時_list": {
                  value: resp.records[i].OutDay1.value,
                  type: "DATETIME"
                },
                "患者ID_list": {
                  value: resp.records[i].ID_Cor.value,
                  type: "NUMBER"
                },
                "病室_list": {
                  value: resp.records[i].RoomNo_Cor.value,
                  type: "NUMBER"
                },
                "氏名_list": {
                  value: resp.records[i].Name_Kanji_Cor.value,
                  type: "SINGLE_LINE_TEXT"
                },
                "カナ_list": {
                  value: resp.records[i].Name_Kana_Cor.value,
                  type: "SINGLE_LINE_TEXT"
                },
                "性別_list": {
                  value: resp.records[i].Sex_Cor.value,
                  type: "NUMBER"
                },
                "年齢_list": {
                  value: resp.records[i].Age_Cor2.value,
                  type: "NUMBER"
                },
                "検査日_list": {
                  value: "",
                  type: "MULTI_LINE_TEXT"
                },
                "検査追加日_list": {
                  value: "",
                  type: "DATETIME"
                },
                "検査結果_list": {
                  value: "",
                  type: "DROP_DOWN"
                }
              }
            });
    
    
    
          disableList.forEach((item2,j)=>{
            record.record.検査リスト.value[i+1].value[item2].disabled = true;//1行目があるので、行数に+1する。
          });
      
      //      console.log("患者リスト:", KanjaList);
          });
          
          //1行目が空だったら削除
          if (!record.record.検査リスト.value[0].value.氏名_list.value){
            record.record.検査リスト.value.splice(0, 1);
          }
    
    //上で設定した代入を実行
        kintone.app.record.set(record);
          console.log("GET 成功");
          
        }, function(error){
          alert('GET NG');
          console.log(error);
        });
        

      //選択したらdisabledにする。
      record.並び順.disabled = true;
    
    }
    
    return event;
    
  });

  //検査項目_一括を選んだら期間選択できるようにする。
  kintone.events.on(['app.record.create.change.検査項目_一括','app.record.create.change.期間2'], function(event) {
    let record = event.record;
    //検査項目が空白だったらここで抜ける
    if(!record.検査項目_一括.value){return;}
    
    listModelist.forEach((item,i)=>{kintone.app.record.setFieldShown(item, true);});
    
    //期間が入ってなかったらここで抜ける。
    if(!record.期間1.value && !record.期間2.value){return;}
    
        //====ここから下は検査日取り込みボタンの設定
        if(document.getElementById('GET_Button') !== null){return;}//増殖バグを防ぐ

        var myAddButton = document.createElement('button');
        myAddButton.id = 'GET_Button';
        myAddButton.innerText = '検査日をリストに表示';
  		  myAddButton.onclick = function() {
  			  var record = kintone.app.record.get().record;
  			  var kensaKomoku = record.検査項目_一括.value;

          //検査情報をGETする！
          var body = {
            'app':kintone.app.getId(),
            'query': 'PCR2 >= "' + record.期間1.value + '" and PCR2 <= "' + record.期間2.value + '"and 検査項目1 in ("' + kensaKomoku + '")',
            'fields': ["IDルックアップ","Name_Kanji_Cor","検査項目1","PCR2"]
          };
          kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', body, function(resp){
            var record = kintone.app.record.get();
    			  var NyutaiinID = "";
    			  var respIndex = "";

            //検査日リストのサブテーブル内で一致するものを検索していく
            record.record.検査リスト.value.forEach((item, i) =>{
              NyutaiinID = record.record.検査リスト.value[i].value.入退院アプリID_list.value;
              //検査日の値を一旦リセット
              record.record.検査リスト.value[i].value.検査日_list.value = "";
              //レスポンス配列の中で入退院アプリIDが一致するものを探す
              respIndex = resp.records.map((v,index) => v.IDルックアップ.value === NyutaiinID ? index:'').filter(String);//A?B:Cは三項演算子「''」で「:」以下(false時)を空にすることで値があるもの（数値(文字列)）が返されたときだけをフィルタリングできるようにしてる。
//              console.log("respIndex",respIndex);              
  
              //一致したら検査日フィールドに代入
              if(respIndex.length > 0){
                respIndex.forEach((item,j) =>{
                  //複数個の検査レコードがあったら、日付を列挙する。（1個ならundefinedが表示されないようにそのまま代入）
                  if(record.record.検査リスト.value[i].value.検査日_list.value){
                   record.record.検査リスト.value[i].value.検査日_list.value = record.record.検査リスト.value[i].value.検査日_list.value + "," + resp.records[respIndex[j]].PCR2.value;
                  }else{
                    record.record.検査リスト.value[i].value.検査日_list.value = resp.records[respIndex[j]].PCR2.value;
                  }
                });
              }

              //検査結果を飛ばすような項目の時は結果を触れるようにする。
              record.record.検査リスト.value[i].value["検査結果_list"].disabled = !Boolean(record.record.検査項目_一括.value === "コロナ_PCR検査" || record.record.検査項目_一括.value === "コロナ_抗原検査" || record.record.検査項目_一括.value === "インフルエンザ_抗原検査");

            });
  
            kintone.app.record.set(record);
//            console.log("検査日取得成功");
            console.log("検査日取得成功, resp:",resp);

          }, function(error){
            alert('GET NG');
            console.log(error);
          });
    		};
      
      kintone.app.record.getSpaceElement('Get_Button_space').appendChild(myAddButton);

    
  });


//カナ検索でIDが取得したら、そのIDをIDルックアップフィールドに代入して自動実行。(editモードも)
  kintone.events.on(['app.record.create.change.入退院アプリID_Auto','app.record.edit.change.入退院アプリID_Auto'], function(event) {
    let record = event.record;
    record.IDルックアップ.value = record.入退院アプリID_Auto.value;
    record.IDルックアップ.lookup = true;//ルックアップの自動取得
    return event;
  });
//患者ID検索でIDが取得したら、そのIDをIDルックアップフィールドに代入して自動実行。(editモードも)
  kintone.events.on(['app.record.create.change.入退院アプリID_Auto_患者IDサーチ','app.record.edit.change.入退院アプリID_Auto_患者IDサーチ'], function(event) {
    let record = event.record;
    record.IDルックアップ.value = record.入退院アプリID_Auto_患者IDサーチ.value;
    record.IDルックアップ.lookup = true;//ルックアップの自動取得
    return event;
  });


//外来患者のときmeiboのIDをカナ検索ルックアップ。(editモードも)
  kintone.events.on(['app.record.create.change.meiboアプリID_Auto','app.record.edit.change.meiboアプリID_Auto'], function(event) {
    let record = event.record;
    record.IDルックアップ_外来用.value = record.meiboアプリID_Auto.value;
    record.IDルックアップ_外来用.lookup = true;//ルックアップの自動取得
    return event;
  });
//外来患者のときmeiboのIDを患者ID検索ルックアップ。(editモードも)
  kintone.events.on(['app.record.create.change.meiboアプリID_Auto_患者IDサーチ','app.record.edit.change.meiboアプリID_Auto_患者IDサーチ'], function(event) {
    let record = event.record;
    record.IDルックアップ_外来用.value = record.meiboアプリID_Auto_患者IDサーチ.value;
    record.IDルックアップ_外来用.lookup = true;//ルックアップの自動取得
    return event;
  });

//IDルックアップ_外来用で一旦別の枠に患者情報を入れて、それを正規の枠にそれぞれ代入。(どれから先にルックアップされるかわからないので、全部のイベントで実行)
var gairaiEvents = [
  'app.record.create.change.Name_Kanji_Cor_Gairai','app.record.edit.change.Name_Kanji_Cor_Gairai',
  'app.record.create.change.Name_Kana_Cor_Gairai','app.record.edit.change.Name_Kana_Cor_Gairai',
  'app.record.create.change.ID_Cor_Gairai','app.record.edit.change.ID_Cor_Gairai',
  'app.record.create.change.Age_Cor2_Gairai','app.record.edit.change.Age_Cor2_Gairai',
  'app.record.create.change.NSex_Cor_Gairai','app.record.edit.change.Sex_Cor_Gairai'
  ];
  kintone.events.on(gairaiEvents, function(event) {
    let record = event.record;
    if(record.Name_Kanji_Cor_Gairai){
      let gairaiList1 = ['Name_Kana_Cor_Gairai','Name_Kanji_Cor_Gairai','ID_Cor_Gairai','Age_Cor2_Gairai','Sex_Cor_Gairai'];
      let gairaiList2 = ['Name_Kana_Cor','Name_Kanji_Cor','ID_Cor','Age_Cor2','Sex_Cor'];
      gairaiList1.forEach((item,i)=>{
        record[gairaiList2[i]].value = record[gairaiList1[i]].value;
      });
    }
    return event;
  });


//年月触ったときに期間に代入
  kintone.events.on(['app.record.create.change.検査年','app.record.create.change.検査月'], function(event){
    var record = event.record;
    var kensaYear = record.検査年.value;
    var kensaMonth = record.検査月.value;
//    var test = luxon.DateTime.local(2021,8,26,12,34,56);
    if(kensaYear && kensaMonth){
    record.期間1.value = luxon.DateTime.local(Number(kensaYear),Number(kensaMonth),1,1,0,0).toFormat('yyyy-MM-dd');//月初(1日)
    record.期間2.value = luxon.DateTime.local(Number(kensaYear),Number(kensaMonth),1,1,0,0).endOf('month').toFormat('yyyy-MM-dd');//月末

//    console.log(kensaYear,kensaMonth);
//    console.log(luxon.DateTime.local(Number(kensaYear),Number(kensaMonth),1,1,0,0).toFormat('yyyy-MM-dd'));
//    console.log(luxon.DateTime.local(2021,8,26,12,34,56).toFormat('yyyy-MM-dd'));
    }
    return event;
  });

//開始時刻が入力されたら終了時刻には30分後を代入
  kintone.events.on(['app.record.create.change.開始時刻','app.record.edit.change.開始時刻'], function(event){
    var record = event.record;

    var startTime = luxon.DateTime.fromISO(record.PCR2.value + "T" + record.開始時刻.value);
    var endTime = startTime.plus({minutes: 30}).toFormat('HH:mm');
//    console.log(startTime,endTime);
    //モバイル版では時間と分を別で入力するので、不完全なときにreturn eventをイベントしたら開始時刻に空白が返ってしまって先にすすめなくなる。
    if(record.開始時刻.value){
      record.終了時刻.value = endTime;
      //開始時刻に値があったら終了時刻も表示
      kintone.app.record.setFieldShown('終了時刻', Boolean(record.開始時刻.value));
      return event;//時刻がundefinedのときにeventをreturnすると、空白を返すので使えなくなる。
    }
    
    
    
  });

/*//開始時刻が入力されたら終了時刻には30分後を代入
  kintone.events.on('app.record.create.change.予約枠ID',function(event){
    var record = event.record;
    //最終的にはSuccessで実行するプログラムをテスト
  });
*/

//項目がICの場合は、Dropdownに家族情報を選択肢として表示
  kintone.events.on(['app.record.create.change.検査項目1','app.record.edit.change.検査項目1'], function(event){
    let record = event.record;

    if(record.検査項目1.value==="IC"){
        //====入退院アプリから記録をGETする。====
      var params = {
        'app':66,
  //          "id": 12830
        'query': 'Pt_ID = ' + record.ID_Cor.value
      };
    
        kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', params, function(resp){
//          var record = kintone.app.record.get();
          var resp1 = resp.records[0];  //配列で帰ってきてるので、0番目のレコード部分だけ抽出
          var itemList = [];
          
          if(resp1.Name1.value && resp1.Tel1_1.value){
            itemList.push({value: resp1.Name1.value + "Tel:" + resp1.Tel1_1.value});
          }else if (resp1.Name1.value && resp1.Tel1_2.value){
            itemList.push({value: resp1.Name1.value + "Tel:" + resp1.Tel1_2.value});
          }
          if(resp1.Name2.value){itemList.push({value: resp1.Name2.value + "Tel:" + resp1.Tel2.value})}
          if(resp1.Name3.value){itemList.push({value: resp1.Name3.value + "Tel:" + resp1.Tel3.value})}
          itemList.push({value: 'その他'});
          itemList.push({value: '回診時'});

          const spDropdown = kintone.app.record.getSpaceElement("Dropdown_Space1");
          const drKeyname = new Kuc.Dropdown({
            label: "連絡先・連絡方法",
            requireIcon: "false",
            items: itemList,
            visible: true,
            disabled: false
          });
//          console.log(drKeyname);
//          console.log(itemList);
          spDropdown.appendChild(drKeyname);
          
          drKeyname.addEventListener('change', event => {
            let record = kintone.app.record.get();
            
            //回診時かどうかで表示変更
            if(drKeyname.value === "回診時" || drKeyname.value === "その他"){//リンクしないものは一旦白紙にする。
              record.record.連絡先_氏名.value = "";
              record.record.連絡先_Tel.value = "";
            }
            if(drKeyname.value === "回診時"){//回診時は開始時刻を消す。
              record.record.回診時.value = "回診時";
            }else{
              record.record.回診時.value = "";
            }
            kintone.app.record.setFieldShown("回診時", Boolean(drKeyname.value === "回診時"));//回診時なら表示;
            kintone.app.record.setFieldShown("連絡先_氏名", Boolean(drKeyname.value !== "回診時"));//回診時以外なら表示;
            kintone.app.record.setFieldShown("連絡先_Tel",Boolean(drKeyname.value !== "回診時"));

            //選択した内容によって値を代入
            switch(drKeyname.value){
              case resp1.Name1.value + "Tel:" + resp1.Tel1_1.value:
                record.record.連絡先_氏名.value = resp1.Name1.value;
                record.record.連絡先_Tel.value = resp1.Tel1_1.value;
              break;
              case resp1.Name1.value + "Tel:" + resp1.Tel1_2.value:
                record.record.連絡先_氏名.value = resp1.Name1.value;
                record.record.連絡先_Tel.value = resp1.Tel1_2.value;
              break;              
              case resp1.Name2.value + "Tel:" + resp1.Tel2.value:
                record.record.連絡先_氏名.value = resp1.Name2.value;
                record.record.連絡先_Tel.value = resp1.Tel2.value;
              break;              
              case resp1.Name3.value + "Tel:" + resp1.Tel3.value:
                record.record.連絡先_氏名.value = resp1.Name3.value;
                record.record.連絡先_Tel.value = resp1.Tel3.value;
              break;              
            }
           
            
            kintone.app.record.set(record);
            console.log(event);
//            console.log(resp1);
          });
          
//          console.log("respの中身:",resp);
//          console.log("キーパーソン: ", resp.records[0].Name1.value, resp.records[0].Name2.value,resp.records[0].Name3.value);
          
          
    //上で設定した代入を実行
//        kintone.app.record.set(record);
          console.log("GET 成功");
          
        }, function(error){
          alert('連絡先情報を取得できませんでした。\n連絡先を取得するには、入退院患者情報アプリでID等を取得する必要があります。\nこのまま続けてレコード作成することもできますが、その際は連絡先は手入力となります。');
          console.log(error);
        });
    }
  });

 //単品のときは保存時にエラーチェック
  kintone.events.on('app.record.create.submit', function(event) {
    let record = event.record;
    //保存時に必須事項が入ってなかったらエラーを返す。
    //単品作成モード
    if(record.作成モード.value === 'レコードを1つ作成' || record.作成モード.value === '外来患者レコードを作成(栄養指導)'){
      //氏名と項目と実施日は必須
      if(!record.Name_Kanji_Cor.value){record.Name_Kanji_Cor.error = '患者情報を取得してください';}
      if(!record.検査項目1.value){record.検査項目1.error = '検査項目を入力してください';}
      if(!record.PCR2.value){record.PCR2.error = '日付を選択してください';}
    }else if(record.作成モード.value === '一括作成 (ノルマ確認)'){
      //検査項目は必須
      if(!record.検査項目_一括.value){
        record.検査項目_一括.error = '検査項目を選択してください';
        event.error = '検査項目を選択してください。\n「追加予定日」や「結果」が入力されているレコードは一括で生成できます。';
      }
    }else{//作成モード見選択のとき
      record.作成モード.error = '作成モードを選択してください';
    }
    
    //開始時刻、栄養指導とIDを選んでいるときは、開始時刻がなければエラー（ただし、回診時に値が入っていた時は除く）
    if((record.検査項目1.value==="栄養指導" || record.検査項目1.value==="IC") && !record.開始時刻.value  && !record.回診時.value){
      record.開始時刻.error = "開始時刻を入力してください";
    }
    //事由
    if(record.検査項目1.value==="IC" && !record.事由.value){
      record.事由.error = "選択してください";
    }
    
    return event;
  });

  //一括処理のときは保存時に同じアプリ内へレコードのリストをPOST!
  kintone.events.on('app.record.create.submit.success', function(event) {
    let record = event.record;
    //一括モードのときはレコードを一括でPOST！
    if (record.作成モード.value.indexOf('一括') > -1) {
    
    var bodyPOST ={
      'app': kintone.app.getId(),
      'records': []
    };//まずはbodyを定義

    record.検査リスト.value.forEach((item, i)=>{
      if(record.検査リスト.value[i].value["検査追加日_list"].value){
        //タイトル作成
        var valStatus = "";
        var valTitle = "";
        //結果も「実施できなかった」も入っていなければ、実施予定で結果待ち
        if(!record.検査リスト.value[i].value['検査結果_list'].value){valStatus = "実施予定・結果待ち";}
        if(record.検査リスト.value[i].value['検査結果_list'].value === '実施できなかった'){valStatus = "実施できなかった";}
        if(record.検査項目_一括.value === "コロナ_ワクチン1回目" || record.検査項目_一括.value === "コロナ_ワクチン2回目"){valStatus = "接種";}

        valTitle = record.検査リスト.value[i].value['氏名_list'].value + ' [' + record.検査項目_一括.value +']';
          if(valStatus !==""){
            valTitle = valTitle + ' (' + valStatus + ')';
          }
        
        
        bodyPOST.records.push({
          'PCR2':{
            "value": record.検査リスト.value[i].value["検査追加日_list"].value
          },
          'IDルックアップ':{
            "value": record.検査リスト.value[i].value["入退院アプリID_list"].value
          },
          '検査項目1':{
            "value": record.検査項目_一括.value
          },
          '検査結果':{
            "value": record.検査リスト.value[i].value["検査結果_list"].value
          },
          'タイトル':{
            "value": valTitle
          },
          'Status1':{
            "value": valStatus
          }
        });
        

        
        
      }
    });

  
    return kintone.api(kintone.api.url('/k/v1/records.json', true), 'POST', bodyPOST).then(function(resp) {
      alert("レコードを作成しました");
      console.log(resp);
    }).catch(function(error) {
      alert("レコードを作成失敗");
      console.log(error);
    });
    }
    
    if(record.検査項目1.value === "外来診察" || record.検査項目1.value === "胃カメラ" || record.検査項目1.value === "大腸カメラ"){
    var paramsYoyaku2 = {
          'app':130,
          'id':record.予約枠ID.value,
//          'query': '日付 = "' + record.PCR2.value + '" and 項目 in ("' + record.検査項目1.value + '")',
          'fields': getYoyakuRec
        };

    return kintone.api(kintone.api.url('/k/v1/record.json', true), 'GET', paramsYoyaku2).then(function(resp){
//      let record = kintone.app.record.get();
      var yoyakuwakuTableVal = resp.record.予約枠.value;
      console.log("予約枠テーブルの中身:",yoyakuwakuTableVal);

      var yoyakuwakuIndex = yoyakuwakuTableVal.map((item,index) => item.value.開始時刻.value === record.開始時刻.value ? index : '').filter(String);
      var yoyakuwakutableID = yoyakuwakuTableVal[yoyakuwakuIndex].id;
      var yoyakunNum_old = yoyakuwakuTableVal[yoyakuwakuIndex].value.予約数.value;
      var yoyakuNum_new = Number(yoyakunNum_old) + 1 ;
      var yoyakuRatio_new = yoyakuNum_new / yoyakuwakuTableVal[yoyakuwakuIndex].value.定員.value ;
//      record.予約枠テーブル内ID.value = yoyakuwakutableID;
//      console.log("respの中身:",resp);
//      console.log("予約枠テーブル内ID", yoyakuwakuTableVal[0].id);
//      console.log(yoyakuwakuTableVal.map((item,index) => item.id === "154576" ? index : '').filter(String));
//      console.log(yoyakuwakuTableVal.map((item,index) => item.value.開始時刻.value === record.開始時刻.value ? index : '').filter(String));
      console.log(yoyakuwakuIndex,yoyakuwakutableID,yoyakunNum_old, yoyakuNum_new,yoyakuRatio_new);

//PUTするテーブルデータの中で変更したい値を代入する。
      yoyakuwakuTableVal[yoyakuwakuIndex].value.予約数.value = yoyakuNum_new;
      yoyakuwakuTableVal[yoyakuwakuIndex].value.予約率.value = yoyakuRatio_new;
      
//    }, function(error){
//      alert('GET NG');
//      console.log(error);
/*====PUTのためのbody作成
テーブルの中を更新する場合にはidが必要で、他の行のid情報等も必要になるので、結構面倒・・・
少なくともGETしたオブジェクトをそのまま使って書き換えないと、どこかに格納するには情報が多いので、とりあえずはGET→PUTをするしかないかな・・・。
filter関数で、kintone.app.record.get().record.予約枠.value.find(item => item.id === '152241')とかfilterとかを使うのが一つの方法かな。
→kintone.app.record.get().record.予約枠.value.map((item,index) => item.id === '154471' ? index : '').filter(String)として、
該当するテーブル内のindexを表示し、そのテーブルの値を変更するように書けば良い。
======================*/
      let body = {
        "app":130,
        "id":3,//record.予約枠ID.value,//該当する予定枠アプリのID
        "record":{
          "予約枠":{
            "value": yoyakuwakuTableVal
/*            [
              {
                "id": "154576",
                  "value": {
                  "開始時刻": {
                      "type": "TIME",
                      "value": "09:00"
                  },
                  "終了時刻": {
                      "type": "TIME",
                      "value": "09:30"
                  },
                  "予約数": {
                      "type": "NUMBER",
                      "value": "3"
                  },
                  "定員": {
                      "type": "NUMBER",
                      "value": "5"
                  },
                  "予約率": {
                      "type": "CALC",
                      "value": "60"
                  }
                }
              },
              {"id": "154577"},
              {"id": "154578"},
              {"id": "154579"},
              {"id": "154580"}
            ]*/
          }
        }
      };//まずは個別に定義せざるを得ないものだけで配列(body)をつくる。
      
      return kintone.api(kintone.api.url('/k/v1/record', true), 'PUT', body);
    }).then(function(resp2){
      console.log("PUT成功");//このタイミングだと見えない。。。
//      return event;//successのときに実行してるから、値は変更できないわ・・・
//      alert("PUT成功");
/*    }, function(error){
      alert('PUT NG');
      console.log(error);*/
    });

    }
    
    
  });

//実施日が選択されたとき、項目と実施日の組み合わせで予約枠をGET
  kintone.events.on(['app.record.create.change.PCR2','app.record.edit.change.PCR2'], function(event){
    var record = event.record;
    //予約枠制御項目以外はreturnで抜ける。
    if(record.検査項目1.value !== '外来診察' && record.検査項目1.value !== '胃カメラ' && record.検査項目1.value !== '大腸カメラ'){return;}

    //実施日が選択されて数値があったらGET
    if(record.PCR2.value){
  
    //====予約枠アプリから記録をGETする。====
        var paramsYoyaku = {
          'app':130,
          'query': '日付 = "' + record.PCR2.value + '" and 項目 in ("' + record.検査項目1.value + '")',
          'fields': getYoyakuRec
        };
    
    kintone.api(kintone.api.url('/k/v1/records.json', true), 'GET', paramsYoyaku, function(resp){
      let record = kintone.app.record.get();
      console.log("respの中身:",resp);
//      console.log(resp.records[0].予約枠.value);
      
      var resp2 = resp.records[0].予約枠.value;  //配列で帰ってきてるので、0番目のレコードの予約枠テーブル部分だけ抽出
      var itemList2 = [];
      
      
      //テーブル内を選択肢として抽出
      resp2.forEach((item,i)=>{
        if (resp2[i].value.予約数.value !== resp2[i].value.定員.value){
//          itemList2.push({value: resp2[i].value.開始時刻.value + "~" + resp2[i].value.終了時刻.value + "　予約数：" + resp2[i].value.予約数.value + "/" + resp2[i].value.定員.value});
          itemList2.push({value: resp2[i].value.開始時刻.value + "~" + resp2[i].value.終了時刻.value + "　残り枠：" + Number(resp2[i].value.定員.value - resp2[i].value.予約数.value)});
        }
      });


      const spDropdown2 = kintone.app.record.getSpaceElement("Dropdown_Space2");
      const drKeyname2 = new Kuc.Dropdown({
        label: "予約枠",
        requireIcon: "false",
        items: itemList2,
        visible: true,
        disabled: false
      });
//      console.log(drKeyname2);
//          console.log(itemList);

      //増殖バグを防ぐ
        if (document.getElementById('user-js-Dropdown_Space2').textContent.indexOf("kuc-dropdown") > -1) {
          var removeObj = document.getElementById('user-js-Dropdown_Space2');
          removeObj.removeChild(removeObj.childNodes.item(0));
        }

      spDropdown2.appendChild(drKeyname2);

      //選択した後の動作
      drKeyname2.addEventListener('change', event => {
        let record = kintone.app.record.get();
        record.record.予約枠ID.value = resp.records[0].$id.value;//予約枠IDを転記
        record.record.開始時刻.value = drKeyname2.value.slice(0,5);
        record.record.終了時刻.value = drKeyname2.value.slice(6,11);
        kintone.app.record.set(record);
      });

      
      if(resp.records.length ===0){
        alert("予約枠が設定されていません");
      }

    }, function(error){
      alert('GET NG');
      console.log(error);
    });
    }
  });


//editモード
  kintone.events.on('app.record.edit.show', function(event) {
    let record = event.record;
    record.IDルックアップ.lookup = true;
    record.IDルックアップ_外来用.lookup = true;

    //全てのレコードを一旦消去
    for ( var item in record ) {
      kintone.app.record.setFieldShown(item, false);
     }
     //モードによって表示を変える
    if(record.作成モード.value.indexOf('一括') > -1){
    //一括モード
      console.log('一括モード');
      listModelist.forEach((item,i)=>{kintone.app.record.setFieldShown(item, true);});
    }else if(record.作成モード.value.indexOf('外来') > -1){
      //表示項目
      gairaiModelist.forEach((item,i)=>{
        kintone.app.record.setFieldShown(item, true);
      });
    }else{
    //単品モード(モードが見選択のものも単品モードのはず)
      console.log('単品モード');
    //表示項目
      singleModelist.forEach((item,i)=>{
        kintone.app.record.setFieldShown(item, true);
      });

    
    //操作禁止項目
      let disabelFields = [
        'タイトル','Status1'
      ];
      disabelFields.forEach((item) =>{
        record[item].disabled = true;      
      });
    }
    
    //条件ごとの表示設定を呼び出す
    fieldShow(event);
    
    return event;
  });




})(jQuery);