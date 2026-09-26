/* Existing v0.2 definitions plus selected v0.3 additions. Clinical approval is not inferred from AI review. */
(function(root){
const data={
  "version": "0.3-selected",
  "definitions": {
    "S01": {
      "id": "S01",
      "key": "v02_S01",
      "name": "振り子体操",
      "purpose": "楽に肩を動かす",
      "steps": [
        "左手を机につき、右腕の力を抜きます。体を小さく揺らして腕を動かします。"
      ],
      "doseProposal": "R：20秒×2回",
      "caution": "腕で大きな円を描かない。脱臼感や痛みなら中止",
      "equipment": "安定した机",
      "gates": "G1",
      "pose": "斜め前。左手支持、右腕下垂。小さな体重移動で腕が前後。おもりなし",
      "image": "images/S01.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "左手机支持・右腕下垂、小幅な前後差。力抜きと体重移動は文で補足。",
      "clinicalStatus": "pending_review",
      "sha256": "e01a9d10c679a01aeaf85bc411a0d6f6728cc9556840c1146756c657aa786c1f"
    },
    "S02": {
      "id": "S02",
      "key": "v02_S02",
      "name": "机で腕を滑らせる",
      "purpose": "挙上ROM",
      "steps": [
        "机に右前腕を置き、体を少し後ろへ引いて腕を前へ滑らせます。"
      ],
      "doseProposal": "R",
      "caution": "肩を無理に押し込まない",
      "equipment": "机、タオル",
      "gates": "G1",
      "pose": "右側面。座位、前腕と手を支持。体が後退し肩が屈曲。指で壁を登る図にしない",
      "image": "images/S02.png",
      "imageCaption": "右前腕と手を机で支えたまま、体を少し後ろへ引きます。肩を無理に押し込まないでください。",
      "assetStatus": "修正後採用候補",
      "assetNotes": "生成後実見：右前腕・手をタオル上に支持、前方へ突っ込む姿勢を解消。机端と肩の距離が増え左向き矢印で体後退を示す。別コマのため机の絶対位置・微小移動量は判定不可、本文併用。",
      "clinicalStatus": "pending_review",
      "sha256": "d5893e7c48b88083421310413f796a1c6c1cd58c98472fc448ff834ff793c990"
    },
    "S03": {
      "id": "S03",
      "key": "v02_S03",
      "name": "仰向けの介助腕上げ",
      "purpose": "挙上ROM",
      "steps": [
        "左手で右手首を支え、右腕を指示された高さまで上げて戻します。"
      ],
      "doseProposal": "R",
      "caution": "力任せに引かない",
      "equipment": "ベッド等",
      "gates": "G1",
      "pose": "右斜め側面。両腕が胸前→頭側、左手が右手首支持。体幹は床上",
      "image": "images/S03.png",
      "imageCaption": "",
      "assetStatus": "修正後採用候補",
      "assetNotes": "生成後実見：頭左・足右、手前右腕を奥左手が手首で支持。胸前から頭側へ2コマで挙上、体幹は支持面。",
      "clinicalStatus": "pending_review",
      "sha256": "6d876dfdac9d8f1c3a6dda4d50debbf53cc55dd60984ee7ab21aaa66639ec927"
    },
    "S04": {
      "id": "S04",
      "key": "v02_S04",
      "name": "棒で肩を外に回す",
      "purpose": "外旋ROM",
      "steps": [
        "仰向けで右肘を体の横に置きます。左手で棒を押し、右前腕を外へ動かします。"
      ],
      "doseProposal": "R",
      "caution": "肘は体側。脱臼不安感なら中止",
      "equipment": "棒、肘下タオル",
      "gates": "G1",
      "pose": "足側斜め上。右肘90°、上腕体側固定、前腕のみ外側へ。肩外転を描かない",
      "image": "images/S04.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "仰向け右肘体側タオル支持、右前腕外側・棒介助の終点。開始と回旋は説明文で補う。",
      "clinicalStatus": "pending_review",
      "sha256": "b87a76e41b12fd05e16890daba201809ac2e41f8bd335bffd16b5f99b6160a49"
    },
    "S05": {
      "id": "S05",
      "key": "v02_S05",
      "name": "肩甲骨を軽く寄せる",
      "purpose": "肩甲帯制御",
      "steps": [
        "腕を楽に下ろし、肩甲骨を軽く寄せて戻します。"
      ],
      "doseProposal": "I",
      "caution": "胸を反らし過ぎず、強く下へ押し下げない",
      "equipment": "椅子可",
      "gates": "G0",
      "pose": "後方。腕下垂、肩甲骨の小さい内側移動。過剰な胸張りなし",
      "image": "images/S05.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "後面腕下垂・肩甲帯の小さな寄せ。誇張や下制なし。",
      "clinicalStatus": "pending_review",
      "sha256": "394c8c4e4c579ede06ab9a15b3712c0ec921dcd5eebd70723681b54298934f3a"
    },
    "S06": {
      "id": "S06",
      "key": "v02_S06",
      "name": "肩を外へ押す",
      "purpose": "外旋等尺性",
      "steps": [
        "右肘を体の横で曲げ、右手の甲を左手に軽く押し当てます。"
      ],
      "doseProposal": "I",
      "caution": "腕は動かさず軽い力。手首だけ反らさない",
      "equipment": "肘下タオル",
      "gates": "G1",
      "pose": "正面。右肘90°体側、左手は右手背の外側を抵抗。外向き力矢印",
      "image": null,
      "imageCaption": "画像保留：右手の甲と左手の接触位置を、担当者の実演で確認してください。",
      "assetStatus": "未解決・画像採用保留",
      "assetNotes": "右手背外側への左手抵抗位置が示されない。",
      "clinicalStatus": "pending_review",
      "sha256": null,
      "status": "retired"
    },
    "S07": {
      "id": "S07",
      "key": "v02_S07",
      "name": "肩を内へ押す",
      "purpose": "内旋等尺性",
      "steps": [
        "右肘を体の横で曲げ、右手のひらを左手に軽く押し当てます。"
      ],
      "doseProposal": "I",
      "caution": "上腕は体側で保つ",
      "equipment": "肘下タオル",
      "gates": "G1",
      "pose": "正面。左手が右掌の内側に抵抗。前腕を腹側へ動かそうとする力のみ",
      "image": "images/S07.png",
      "imageCaption": "右肘を体の横で保ち、右手のひらを左手に軽く押し当てます。矢印は力の向きで、腕を動かす量ではありません。",
      "assetStatus": "修正後採用候補",
      "assetNotes": "生成後実見：右前腕が前方へ伸び手首がほぼ一直線。右掌の内側に左手を当て、内向き力矢印。両腕の連続性と体側タオルを確認。",
      "clinicalStatus": "pending_review",
      "sha256": "8efd89d2bb4b245228b88d7086efc591f2bd0d50342e77c0dfc8c658a2c26541"
    },
    "S08": {
      "id": "S08",
      "key": "v02_S08",
      "name": "壁で腕を滑らせる",
      "purpose": "挙上制御",
      "steps": [
        "両手を壁のタオルに置き、許可された高さへ滑らせて戻します。"
      ],
      "doseProposal": "R→M：開始は5回",
      "caution": "腰を大きく反らさない",
      "equipment": "壁、タオル",
      "gates": "G1",
      "pose": "側面。手は胸高→許可された高さ。両足接地、肘屈曲から伸展",
      "image": "images/S08.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両手タオル壁支持で挙上、足底接地、腰の過反りなし。",
      "clinicalStatus": "pending_review",
      "sha256": "6a1e6f28fe8d567ed2315421ae4426828c711c946109947f9b3bd4b6bc40b7a9"
    },
    "S09": {
      "id": "S09",
      "key": "v02_S09",
      "name": "横向きで肩を外に回す",
      "purpose": "腱板筋力",
      "steps": [
        "左を下に寝て、右肘を体の横に保ちます。右前腕をゆっくり持ち上げて戻します。"
      ],
      "doseProposal": "M：最初は重りなし",
      "caution": "体を後ろへ転がさない",
      "equipment": "タオル、軽い重りは任意",
      "gates": "G1",
      "pose": "足側斜め上。右上腕体側、肘90°。右前腕が腹前→天井方向。肩外転でない",
      "image": "images/S09.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "左下側臥位で右上腕タオル近傍、右前腕の持上げ。厳密な肘90度は投影で未確定。",
      "clinicalStatus": "pending_review",
      "sha256": "f9bba4a86a1b409cb26d22ae020d3eb3af94cab25aea5f4871e4722008a0fde9"
    },
    "S10": {
      "id": "S10",
      "key": "v02_S10",
      "name": "ゴムで肩を外に回す",
      "purpose": "腱板筋力",
      "steps": [
        "ゴムを両手で持ち、左手を固定します。右肘を体側に保ち、右手を外へ動かします。"
      ],
      "doseProposal": "M",
      "caution": "手首を曲げず、戻しもゆっくり",
      "equipment": "軽いゴム",
      "gates": "G1",
      "pose": "正面。左手は腹前、右肘固定。右前腕のみ外へ。ゴムは両手間",
      "image": "images/S10.png",
      "imageCaption": "肘を体の横で曲げたまま、前腕を少し外へ開いて戻します。",
      "assetStatus": "採用候補",
      "assetNotes": "右肘屈曲が保たれ外旋でバンドを伸ばす。厳密な体側接触は不確実だが伸展エラーなし。",
      "clinicalStatus": "pending_review",
      "sha256": "7d3356aecf5e5375f2dd6f78b797ca50191a524d7619f88e1e024cd096a6bcae"
    },
    "S11": {
      "id": "S11",
      "key": "v02_S11",
      "name": "仰向けで手を天井へ",
      "purpose": "前鋸筋",
      "steps": [
        "仰向けで右手を天井へ向けます。肘を伸ばしたまま、肩を少し浮かせて戻します。"
      ],
      "doseProposal": "M：重りなしから",
      "caution": "腕全体を頭側へ倒さない",
      "equipment": "ベッド等",
      "gates": "G1",
      "pose": "側面。肩90°屈曲、右肘伸展。肩甲骨がわずかに床から離れる前方突出",
      "image": "images/S11.png",
      "imageCaption": "肘を伸ばしたまま、手を天井へ少し近づけて戻します。腕を頭側へ倒さないでください。",
      "assetStatus": "修正後採用候補",
      "assetNotes": "生成後実見：頭右、手前左腕は床、奥右腕は天井へ。肘伸展を保ち小さな上矢印。肩甲骨そのものは隠れるため本文を併用。",
      "clinicalStatus": "pending_review",
      "sha256": "40c3f03b4ce80ae864c1560cf0185850dcce3292cd2f5429c5b64a69c257ad54"
    },
    "S12": {
      "id": "S12",
      "key": "v02_S12",
      "name": "ゴムを引く",
      "purpose": "肩甲帯・上肢筋力",
      "steps": [
        "胸より低い位置に固定したゴムを、両肘を曲げて体へ引きます。"
      ],
      "doseProposal": "M",
      "caution": "固定部を確認。肩をすくめ過ぎない",
      "equipment": "ゴム、専用の安全な固定部",
      "gates": "G8",
      "pose": "斜め側面。アンカーは前方・肘高、両手→下部肋骨。ドアノブへ適当に結ばない",
      "image": "images/S12.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "前方肘高専用固定部、両手を下部肋骨へ引く。",
      "clinicalStatus": "pending_review",
      "sha256": "963af1eb32ca30d2124ad8712185d677ed41a93c60eb27c7281dd79d83294cd4"
    },
    "S13": {
      "id": "S13",
      "key": "v02_S13",
      "name": "壁の腕立て",
      "purpose": "上肢支持",
      "steps": [
        "壁に両手をつき、肘を曲げて体を近づけ、押し戻します。"
      ],
      "doseProposal": "M",
      "caution": "壁は滑らないこと。肩前面痛なら浅く",
      "equipment": "壁",
      "gates": "G1",
      "pose": "側面。頭から踵まで自然な一直線。踵接地、肘曲げ→伸ばし",
      "image": "images/S13.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両手壁・踵接地・肘屈伸、体幹自然な直線。",
      "clinicalStatus": "pending_review",
      "sha256": "2f6eb7915ba1bfaeef5337e11e25958b4277398d9d03f01dbeb1ae7c81f0fb5b"
    },
    "S14": {
      "id": "S14",
      "key": "v02_S14",
      "name": "壁を押して肩甲骨を動かす",
      "purpose": "前鋸筋・支持",
      "steps": [
        "壁に両手をつき、肘をほぼ伸ばして壁を押します。肩甲骨を動かして戻します。"
      ],
      "doseProposal": "M",
      "caution": "腰を丸める動きで代用しない",
      "equipment": "壁",
      "gates": "G1",
      "pose": "側面。肘角は一定。胸郭と肩甲骨の相対移動のみ、腕立てと区別",
      "image": "images/S14.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両肘ほぼ伸展一定・壁支持・肩甲帯小差。微小運動は説明文で補う。",
      "clinicalStatus": "pending_review",
      "sha256": "f7ca399e9cd48d2e0bd2ed4639b17d12d8536b94a19243e7d43f2f64d051f761"
    },
    "S15": {
      "id": "S15",
      "key": "v02_S15",
      "name": "斜め前へ腕を上げる",
      "purpose": "挙上筋力",
      "steps": [
        "親指を上に向け、右腕を体の少し斜め前へ上げて戻します。"
      ],
      "doseProposal": "M：重りなしから",
      "caution": "許可された高さまで",
      "equipment": "任意の軽い重り",
      "gates": "G1",
      "pose": "斜め前。体の真横より約30°前方、肩甲面で挙上。親指上",
      "image": "images/S15.png",
      "imageCaption": "担当者が示した斜め前の方向へ、親指を上にして腕を上げます。",
      "assetStatus": "説明補強",
      "assetNotes": "親指上の右腕挙上。肩甲面角度は2Dで不確実、図が誤りとは断定しない。",
      "clinicalStatus": "pending_review",
      "sha256": "49edb72e42dbeffd22291f30507c7c28ab895efe474b5a0c1b8350afa5c2aabd"
    },
    "S16": {
      "id": "S16",
      "key": "v02_S16",
      "name": "肩の横のストレッチ",
      "purpose": "柔軟性",
      "steps": [
        "左手で右上腕を支え、右腕を胸の前へ軽く寄せます。"
      ],
      "doseProposal": "S",
      "caution": "肩の前が痛い・抜けそうなら中止。拘縮評価後に選択",
      "equipment": "なし",
      "gates": "G1",
      "pose": "前方。右腕は胸前、左手は右上腕を支持。頚部を圧迫しない",
      "image": "images/S16.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右腕胸前・左手右上腕支持・頚部圧迫なし。",
      "clinicalStatus": "pending_review",
      "sha256": "e4e3e135dc9159332f0f944d6a239df64685d77a3fdc92c58c21f9f0d00af153"
    },
    "S17": {
      "id": "S17",
      "key": "v02_S17",
      "name": "抵抗をつけて肩を外に回す",
      "purpose": "腱板負荷の漸増",
      "steps": [
        "ゴムを両手で持ち、左手を固定します。右肘を体側に保ち、右手を外へ動かします。",
        "S10と同じ動きを、担当者が選んだ強さのゴムで行います。"
      ],
      "doseProposal": "M：抵抗値は処方必須",
      "caution": "痛みを押して強いゴムへ変えない",
      "equipment": "強度指定ゴム",
      "gates": "G1",
      "pose": "S10の抵抗variant。角度は同じ、ゴム強度だけ変更。別運動として水増ししない",
      "image": "images/S17.png",
      "imageCaption": "肘を体の横で曲げたまま、前腕を少し外へ開いて戻します。抵抗は担当者が決めたものを使います。",
      "assetStatus": "採用候補",
      "assetNotes": "S10と同PNGの抵抗違い。強度は処方欄で指定。",
      "clinicalStatus": "pending_review",
      "sha256": "7d3356aecf5e5375f2dd6f78b797ca50191a524d7619f88e1e024cd096a6bcae",
      "baseExerciseId": "S10"
    },
    "S18": {
      "id": "S18",
      "key": "v02_S18",
      "name": "壁のボールを小さく動かす",
      "purpose": "上肢支持・制御",
      "steps": [
        "右手でボールを壁に軽く押し、小さく上下左右へ動かします。"
      ],
      "doseProposal": "C：各方向5回",
      "caution": "肩の高さ以下から。球が落ちない軽い圧",
      "equipment": "壁、柔らかい球",
      "gates": "G1",
      "pose": "斜め側面。片手で胸高の球を保持、小さな十字軌道。投げない",
      "image": "images/S18.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右手胸高の球・壁接触と小十字矢印。",
      "clinicalStatus": "pending_review",
      "sha256": "f1dec80949ac82655cb3dcde6fe3b94ab4173da65200ab462e91a36d8463dddf"
    },
    "S19": {
      "id": "S19",
      "key": "v02_S19",
      "name": "背中へ手を回す",
      "purpose": "結帯動作",
      "steps": [
        "右手を腰の後ろへ回し、無理のない範囲で少し上へ動かします。"
      ],
      "doseProposal": "R：5回",
      "caution": "他方の手やタオルで強く引き上げない",
      "equipment": "なし",
      "gates": "G1",
      "pose": "後方。右手が右臀部→腰部。挙上範囲は処方に合わせる",
      "image": "images/S19.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右手が臀部から腰へ、左腕下垂で一貫。",
      "clinicalStatus": "pending_review",
      "sha256": "05fa99fea78ea8299d913b06418a48c95770b2af31cc69a94fe1f8144ad8a20c"
    },
    "S20": {
      "id": "S20",
      "key": "v02_S20",
      "name": "台を使った腕立て",
      "purpose": "上肢筋力",
      "steps": [
        "動かない高い台に両手をつき、肘を曲げて体を近づけ、戻します。"
      ],
      "doseProposal": "M",
      "caution": "キャスター付き机不可。肩痛なら壁へ退行",
      "equipment": "頑丈な台",
      "gates": "G1+G8",
      "pose": "側面。台の転倒・滑りがない姿勢。足と手の4点支持",
      "image": "images/S20.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両手台上と両足支持、体幹直線・肘屈伸。",
      "clinicalStatus": "pending_review",
      "sha256": "ba311dfcdce72bddcc4172a7202f0397af2541101f8c3973dc85ff6c9ff1b8e8"
    },
    "S21": {
      "id": "S21",
      "key": "v02_S21",
      "name": "支え付き片手ロー",
      "purpose": "引く筋力",
      "steps": [
        "左手を机につき、右手の重りを脇へ引いて戻します。"
      ],
      "doseProposal": "M",
      "caution": "体幹をねじらず、肩を無理に後ろへ引かない",
      "equipment": "机、軽い重り",
      "gates": "G1+G8",
      "pose": "右側面。左手支持、右腕下垂→右肘屈曲。肩の高さまで肘を上げない",
      "image": "images/S21.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "左手机支持・右手重り下垂から脇へ。",
      "clinicalStatus": "pending_review",
      "sha256": "5b919755e3426c9787244d5b97ed6e184a1d32bdacf5da34a701c8cb8dda6326"
    },
    "S22": {
      "id": "S22",
      "key": "v02_S22",
      "name": "軽い物を持って歩く",
      "purpose": "持ち運び",
      "steps": [
        "両手に指示された重さの物を持ち、平らな場所をゆっくり歩きます。"
      ],
      "doseProposal": "M：10〜20秒×2回",
      "caution": "首・肩・腕症状が増えたら中止",
      "equipment": "同重量の荷物、空間",
      "gates": "G8",
      "pose": "正面斜め。両腕体側、荷物は体の横、足元に障害物なし",
      "image": "images/S22.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両手荷物体側・障害物なしの歩行。荷重値は処方欄で指定。",
      "clinicalStatus": "pending_review",
      "sha256": "113b8ace25da9303fde413cb263974e69f2bf97eb47f8e3ccee2e3913cbd9c8c"
    },
    "S23": {
      "id": "S23",
      "key": "v02_S23",
      "name": "肘を曲げ伸ばしする",
      "purpose": "肘ROM",
      "steps": [
        "上腕を体の横で支え、肘をゆっくり曲げ伸ばしします。"
      ],
      "doseProposal": "R",
      "caution": "術後は自動/介助の許可を確認。重りなしでも二頭筋は働く",
      "equipment": "必要時タオル",
      "gates": "G1+G3",
      "pose": "側面。右上腕体側、肘屈伸。肩挙上なし。介助variantは左手支持",
      "image": "images/S23.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "左手で右上腕支持・右肘屈伸、肩挙上なし。",
      "clinicalStatus": "pending_review",
      "sha256": "d257d800d9bbb053e5d811a4dd4397e431eb41d986ca15d6755e756c1bd23f75"
    },
    "S24": {
      "id": "S24",
      "key": "v02_S24",
      "name": "軽い肘曲げ",
      "purpose": "上腕二頭筋負荷",
      "steps": [
        "右肘を体側に置き、軽い重りをゆっくり上げ下げします。"
      ],
      "doseProposal": "M：許可後に下限から",
      "caution": "SLAP・二頭筋手術後は許可必須",
      "equipment": "軽い重り",
      "gates": "G3",
      "pose": "正面。上腕固定、前腕回外、肘のみ屈伸。体を振らない",
      "image": "images/S24.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右手重りで回外肘屈伸、上腕体側。",
      "clinicalStatus": "pending_review",
      "sha256": "74eb2e7b05eca1ef53f9d1879a1390e82b074f8a5df29ebaeb03eb57c19c6499"
    },
    "S25": {
      "id": "S25",
      "key": "v02_S25",
      "name": "腕を上げた肩の外旋",
      "purpose": "競技準備",
      "steps": [
        "右上腕を台で支え、肘を曲げた姿勢から前腕をゆっくり起こします。"
      ],
      "doseProposal": "M：5〜8回×1から",
      "caution": "外転外旋位の不安感・前面痛なら中止",
      "equipment": "上腕支持台、負荷は処方指定",
      "gates": "G2+G7",
      "pose": "足側斜め。上腕は許可された外転位（90°variant）、肘90°。回転軸は上腕長軸",
      "image": "images/S25.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右上腕と肘を高台支持、肘屈曲前腕垂直の終点。回旋説明が必要。",
      "clinicalStatus": "pending_review",
      "sha256": "070d9a9f66abb878ddc49a22698c77004a260045a0db1a73498717e65c8cef6c"
    },
    "S26": {
      "id": "S26",
      "key": "v02_S26",
      "name": "頭上保持",
      "purpose": "競技の保持耐性",
      "steps": [
        "許可された位置に右腕を上げ、軽い重りを短く保持します。"
      ],
      "doseProposal": "C：5〜10秒×3",
      "caution": "歩行は加えない。真上まで上げられない人へ強制しない",
      "equipment": "軽い重り",
      "gates": "G2+G7",
      "pose": "側面。右腕挙上保持、腰過伸展なし。歩行・振り回し矢印なし",
      "image": "images/S26.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右腕頭上の静止保持、腰過伸展なし。",
      "clinicalStatus": "pending_review",
      "sha256": "0784b390b4546bee26e219136e83d7e7cf8562adb4bce0fa72dab9b22f953eac"
    },
    "T01": {
      "id": "T01",
      "key": "v02_T01",
      "name": "楽な呼吸",
      "purpose": "力みを減らす",
      "steps": [
        "仰向けで膝を立て、息を止めずゆっくり呼吸します。"
      ],
      "doseProposal": "C：5呼吸×2",
      "caution": "腰を床へ強く押しつけない",
      "equipment": "ベッド等",
      "gates": "G0",
      "pose": "側面。両膝立て、手は腹部、胸腹の小さな呼吸表示",
      "image": "images/T01.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両膝立て・手腹部・小呼吸表示、支持適合。",
      "clinicalStatus": "pending_review",
      "sha256": "4c130e02aa47864fee6a6acea4ce05d2db8649ba67add0c974170bcf28eaec13"
    },
    "T02": {
      "id": "T02",
      "key": "v02_T02",
      "name": "骨盤の小さな前後運動",
      "purpose": "骨盤制御",
      "steps": [
        "仰向けで膝を立て、腰のすき間を少し増減させます。"
      ],
      "doseProposal": "R：5〜10回",
      "caution": "大きく反らさない。分離症では許可範囲のみ",
      "equipment": "ベッド等",
      "gates": "G6該当時",
      "pose": "側面。骨盤の小さな傾き2コマ、臀部は床についたまま",
      "image": "images/T02.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "臀部接地・小骨盤差。微小差は説明で補う。",
      "clinicalStatus": "pending_review",
      "sha256": "0e5e6675cd3056a56ba34c9b6478dee55bd0898234589e3bb9d627da8220a1eb"
    },
    "T03": {
      "id": "T03",
      "key": "v02_T03",
      "name": "四つ這いで背中を動かす",
      "purpose": "体幹ROM",
      "steps": [
        "四つ這いで、背中を小さく丸めて戻します。許可された範囲で反らします。"
      ],
      "doseProposal": "R",
      "caution": "どちらの方向も痛みを追いかけない",
      "equipment": "マット",
      "gates": "G0",
      "pose": "側面。手肩下・膝股下、小範囲の胸腰部屈伸。極端な落ち込みなし",
      "image": "images/T03.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "四つ這い手膝支持、丸めから軽い伸展。頚部過伸展なし。",
      "clinicalStatus": "pending_review",
      "sha256": "90b04bf8ed78f24cafeb9d537aa804169f0147bc556564017ddae73193ffb1df"
    },
    "T04": {
      "id": "T04",
      "key": "v02_T04",
      "name": "横向きで胸を開く",
      "purpose": "胸椎回旋",
      "steps": [
        "左を下に寝て両膝を曲げます。右腕を開き、胸をゆっくり右へ向けて戻します。"
      ],
      "doseProposal": "R：左右各5回",
      "caution": "膝を重ねて骨盤は大きく回さない",
      "equipment": "枕、マット",
      "gates": "G0",
      "pose": "斜め上。両股膝屈曲、膝接触を保持。右腕が胸前→右側、腰の過回旋なし",
      "image": "images/T04.png",
      "imageCaption": "",
      "assetStatus": "修正後採用候補",
      "assetNotes": "生成後実見：頭右で左下側臥位。下左腕は前へ残り、上右腕が胸とともに開く。両膝が重なって接触、両腕の連続性あり。",
      "clinicalStatus": "pending_review",
      "sha256": "cf2f589728387f2e5b2ffbe24b0902ee29d38d50c6f4ac7a966bdee95d2409a1"
    },
    "T05": {
      "id": "T05",
      "key": "v02_T05",
      "name": "座って胸を回す",
      "purpose": "胸椎回旋",
      "steps": [
        "椅子に座り、胸の前で腕を組み、胸を小さく左右へ回します。"
      ],
      "doseProposal": "R：左右各5回",
      "caution": "腰や脚の痛みが広がれば中止",
      "equipment": "椅子",
      "gates": "G0",
      "pose": "前斜め。骨盤前向き、胸郭のみ小回旋。手で首を引かない",
      "image": "images/T05.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "骨盤前向きで胸郭回旋、首だけではない。頭胸角度差は小。",
      "clinicalStatus": "pending_review",
      "sha256": "724ba8b9ddaf652533ac226e809949e810742971320fec2b35b1a22a88403d93"
    },
    "T06": {
      "id": "T06",
      "key": "v02_T06",
      "name": "仰向けの足踏み",
      "purpose": "体幹制御",
      "steps": [
        "仰向けで両膝を立て、片足を少し浮かせて戻します。左右交互に行います。"
      ],
      "doseProposal": "C：左右各5回",
      "caution": "腰が大きく反らない高さ",
      "equipment": "マット",
      "gates": "G0",
      "pose": "側面。開始は両足床。片足のみ数cm浮く。両股関節90°の図にしない",
      "image": "images/T06.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "一足だけ少し浮く、反対足と頭体幹支持。",
      "clinicalStatus": "pending_review",
      "sha256": "423c67dd8fdaa86ee6e72f7f37dd7290e89cddf47a13c6959cf39c0f04273ffa"
    },
    "T07": {
      "id": "T07",
      "key": "v02_T07",
      "name": "四つ這いの対角伸ばし",
      "purpose": "体幹制御",
      "steps": [
        "四つ這いから右腕と左脚を伸ばし、戻します。反対側も行います。"
      ],
      "doseProposal": "C：左右各5回",
      "caution": "骨盤を回さず、脚を高く上げ過ぎない",
      "equipment": "マット",
      "gates": "G6該当時",
      "pose": "左右識別できる斜め上。右腕＋左脚が伸展、左手＋右膝は床。4肢全て描く",
      "image": "images/T07.png",
      "imageCaption": "",
      "assetStatus": "修正後採用候補",
      "assetNotes": "生成後実見：左向きで手前左手と奥右膝支持、奥右腕と手前左脚を伸展。4肢連続、脚は体幹とほぼ同高。",
      "clinicalStatus": "pending_review",
      "sha256": "02277c93480ed5aaeb5ee8c834ee5cc1de93f935ad3b791767faea3183e8bc08"
    },
    "T08": {
      "id": "T08",
      "key": "v02_T08",
      "name": "両脚のお尻上げ",
      "purpose": "殿筋",
      "steps": [
        "仰向けで両膝を立て、お尻を少し上げて戻します。"
      ],
      "doseProposal": "M",
      "caution": "腰を反らすより股関節で動く",
      "equipment": "マット",
      "gates": "G0",
      "pose": "側面。両足床、骨盤挙上。膝と肩を結ぶ程度、腰過伸展なし",
      "image": "images/T08.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両足と肩背部支持で骨盤挙上、過伸展目立たず。",
      "clinicalStatus": "pending_review",
      "sha256": "38be85409d3c376bd59dbbc6bb530495a2fa45957181a93a44b9f2e2a46d381e"
    },
    "T09": {
      "id": "T09",
      "key": "v02_T09",
      "name": "膝つき横支え",
      "purpose": "体幹の側方支持",
      "steps": [
        "横向きで肘と曲げた膝をつき、お尻を少し浮かせます。"
      ],
      "doseProposal": "C：左右各5秒×3",
      "caution": "肩が痛い人は除外",
      "equipment": "マット",
      "gates": "G0",
      "pose": "正面斜め。下側肘肩下、両膝屈曲、肘と膝支持。手支持と混同しない",
      "image": "images/T09.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "下側左肘肩下と屈曲膝支持、臀部浮き。",
      "clinicalStatus": "pending_review",
      "sha256": "e5389c144c55cbb3b7558d5cac88f118d47f452f71d0890cfee6b63a3b41287a"
    },
    "T10": {
      "id": "T10",
      "key": "v02_T10",
      "name": "お尻を後ろへ引く",
      "purpose": "ヒップヒンジ",
      "steps": [
        "立って膝を少し曲げ、お尻を後ろへ引き、戻します。"
      ],
      "doseProposal": "C：5〜8回",
      "caution": "体を倒す深さより股関節から動く感覚",
      "equipment": "壁を後方目標に可",
      "gates": "G0",
      "pose": "側面。股関節屈曲、膝軽度屈曲。腰だけを丸める図でない",
      "image": "images/T10.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "股関節から後方へ臀部を引く軽い膝曲げ、腰だけ丸めず。",
      "clinicalStatus": "pending_review",
      "sha256": "a97e53dce3f2207084d1db4c07d4ffc5f78c77c8ad705be27556494847109437"
    },
    "T11": {
      "id": "T11",
      "key": "v02_T11",
      "name": "仰向けの対角伸ばし",
      "purpose": "体幹制御",
      "steps": [
        "両手を天井へ向け、両脚を持ち上げます。右腕と左脚を伸ばして戻し、反対も行います。"
      ],
      "doseProposal": "C：左右各3〜5回",
      "caution": "腰が反る前に止める。保持姿勢が難しければT06",
      "equipment": "マット",
      "gates": "G6該当時",
      "pose": "斜め上。開始：両肩屈曲90°、両股膝90°。終了：右腕頭側＋左脚足側、左腕垂直＋右股膝90°固定",
      "image": "images/T11.png",
      "imageCaption": "図は右腕と左脚を伸ばした位置です。指示された範囲で行います。",
      "assetStatus": "採用候補",
      "assetNotes": "右腕頭側＋左脚足側、左腕垂直＋右股膝屈曲の終点。前の左右逆判定を支持しない。開始姿勢は説明補足。",
      "clinicalStatus": "pending_review",
      "sha256": "fc7b2f3e1a6473ee7c71dda8f28cf08fa2ba8dace813f61d806987eaab2fcdbb"
    },
    "T12": {
      "id": "T12",
      "key": "v02_T12",
      "name": "横支え",
      "purpose": "体幹持久力",
      "steps": [
        "横向きで肘と足をつき、体を持ち上げて保ちます。"
      ],
      "doseProposal": "C：左右各5〜10秒×3",
      "caution": "肩や腰に痛みが出たら膝つきへ",
      "equipment": "マット",
      "gates": "G0",
      "pose": "正面斜め。肘肩下、膝伸展、両足を前後にずらして支持可",
      "image": "images/T12.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "肘肩下・伸展膝・ずらした両足支持、横支え成立。",
      "clinicalStatus": "pending_review",
      "sha256": "0118dd09aeff9cf817abf0b0b8355c3194b45edf5331b0578cb74ab9a5ed0da3"
    },
    "T13": {
      "id": "T13",
      "key": "v02_T13",
      "name": "片脚のお尻上げ",
      "purpose": "殿筋",
      "steps": [
        "仰向けで片足を床から上げ、反対の足でお尻を持ち上げます。"
      ],
      "doseProposal": "M：左右各5〜8回",
      "caution": "腰を反らさず骨盤を水平に",
      "equipment": "マット",
      "gates": "G0",
      "pose": "足側斜め。右足床、左股膝屈曲で浮く、骨盤挙上",
      "image": "images/T13.png",
      "imageCaption": "",
      "assetStatus": "修正後採用候補",
      "assetNotes": "生成後実見：頭右で手前左脚が浮上、奥右足が接地。両腕接地と骨盤挙上、四肢連続性を確認。",
      "clinicalStatus": "pending_review",
      "sha256": "f7b0a2aea59ab608c0fb2445709b9d952dc216d01924877f01713618c28b0e74"
    },
    "T14": {
      "id": "T14",
      "key": "v02_T14",
      "name": "軽い荷物を持つヒンジ",
      "purpose": "持ち上げ動作",
      "steps": [
        "両手で軽い荷物を体の近くに持ち、お尻を後ろへ引いて戻します。"
      ],
      "doseProposal": "M",
      "caution": "初めは床まで下ろさない。負荷はPT指定",
      "equipment": "軽い荷物",
      "gates": "G8",
      "pose": "側面。荷物は前腿近く、股関節で折り、すね中間より上まで",
      "image": "images/T14.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "荷物体近く、股関節屈曲で膝付近まで、床へ下ろさず。",
      "clinicalStatus": "pending_review",
      "sha256": "9809a646395e6fcb80ffae4d7a43ac85d1b8f0fbb1f4153dd7031492fcbf4296"
    },
    "T15": {
      "id": "T15",
      "key": "v02_T15",
      "name": "椅子で胸を起こす",
      "purpose": "胸椎運動",
      "steps": [
        "背もたれ上部に背中を当て、胸を少し起こして戻します。"
      ],
      "doseProposal": "R：5回",
      "caution": "首だけを反らさない。骨粗鬆症・圧迫骨折歴は要評価",
      "equipment": "安定した椅子",
      "gates": "G0",
      "pose": "側面。胸椎の小伸展、頚部は中間に近い。反り返りなし",
      "image": "images/T15.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "胸の小起こし・頭中間位・足座面支持。局所胸腰運動は未確定。",
      "clinicalStatus": "pending_review",
      "sha256": "5b31790c2bea9665eeb8a293780d17e424e730ba6bbfb402d1b2649eb8eef8ce"
    },
    "T16": {
      "id": "T16",
      "key": "v02_T16",
      "name": "片膝を軽く抱える",
      "purpose": "症状緩和の屈曲",
      "steps": [
        "仰向けで片方の太ももを支え、膝を胸へ少し近づけて戻します。"
      ],
      "doseProposal": "R：片側5回",
      "caution": "屈曲で脚症状が増える人には使わない",
      "equipment": "マット",
      "gates": "G5",
      "pose": "側面。手は膝裏の大腿を支える。強く膝前面を引かない",
      "image": "images/T16.png",
      "imageCaption": "",
      "assetStatus": "修正後採用候補",
      "assetNotes": "生成後実見：両コマで手前右脚を曲げ、奥左脚は伸ばして支持。終了時の手は膝前面ではなく膝裏側の大腿を支える。頭・体幹はマット上。",
      "clinicalStatus": "pending_review",
      "sha256": "73c350cb5f3e4caa8ca1494e88e23429932b8ea4d47abd680362a95f04a49a91"
    },
    "T17": {
      "id": "T17",
      "key": "v02_T17",
      "name": "うつ伏せの小さな上体起こし",
      "purpose": "個別方向運動",
      "steps": [
        "うつ伏せから肘で支え、担当者に示された範囲だけ上体を起こします。"
      ],
      "doseProposal": "R：5回から、反応を再確認",
      "caution": "伸展で症状が軽減する人限定。末梢化で中止。分離症の未許可期不可",
      "equipment": "マット",
      "gates": "G5",
      "pose": "側面。肘支持、骨盤・大腿は床。腕立ての大きな伸展にしない",
      "image": "images/T17.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "肘支持で小上体起こし、骨盤大腿床。適応は個別指示に保持。",
      "clinicalStatus": "pending_review",
      "sha256": "a90d246652980696676ae99f2674f34b3274ab3ea8ebb8da2787b1a8158c133e"
    },
    "T18": {
      "id": "T18",
      "key": "v02_T18",
      "name": "座位で小さく前にかがむ",
      "purpose": "個別方向運動",
      "steps": [
        "椅子に座り、手を太ももに添えて上体を少し前へ倒し、戻します。"
      ],
      "doseProposal": "R：5回から",
      "caution": "屈曲で症状が軽減する人限定。脚へ広がれば中止",
      "equipment": "椅子",
      "gates": "G5",
      "pose": "側面。両足床、手は腿上、体幹の小屈曲。深い床タッチなし",
      "image": "images/T18.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "足床・手腿で小前屈、床タッチなし。",
      "clinicalStatus": "pending_review",
      "sha256": "9d09ae6adb985bc597bcbc137bd8b0094fad01c7d918c79965add4b98c24a57f"
    },
    "T19": {
      "id": "T19",
      "key": "v02_T19",
      "name": "両手の荷物を運ぶ",
      "purpose": "体幹と生活動作",
      "steps": [
        "軽い同じ重さの荷物を両手に持ち、短い距離を歩きます。"
      ],
      "doseProposal": "M：10〜20秒×2",
      "caution": "症状が出る距離まで無理に伸ばさない",
      "equipment": "荷物、空間",
      "gates": "G8",
      "pose": "S22と同一姿勢資産可。体幹機能を目的とする別ラベル",
      "image": "images/T19.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両手荷物で歩行、S22共用整合。",
      "clinicalStatus": "pending_review",
      "sha256": "113b8ace25da9303fde413cb263974e69f2bf97eb47f8e3ccee2e3913cbd9c8c"
    },
    "T20": {
      "id": "T20",
      "key": "v02_T20",
      "name": "横向きのゴムに耐える",
      "purpose": "回旋制御",
      "steps": [
        "体の横に固定したゴムを胸前で持ち、両手を少し前へ伸ばして戻します。"
      ],
      "doseProposal": "C：左右各5回",
      "caution": "体を回さない。分離症は回旋抵抗の許可を確認",
      "equipment": "ゴム、専用固定点",
      "gates": "G6該当時+G8",
      "pose": "正面。固定点は真横の胸高。両手胸前→前方、骨盤前向き保持",
      "image": "images/T20.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "側方胸高専用アンカー・胸前から前へ、骨盤前向き。",
      "clinicalStatus": "pending_review",
      "sha256": "bbcdc4d0bde607ca10631bfa5342a46effb37b476e08c3f02da214dbbc1843fa"
    },
    "T21": {
      "id": "T21",
      "key": "v02_T21",
      "name": "呼吸を続けてお腹を支える",
      "purpose": "低負荷体幹",
      "steps": [
        "仰向けで膝を立て、お腹へ軽く力を入れながら呼吸を続けます。"
      ],
      "doseProposal": "C：5呼吸×2",
      "caution": "お腹を強くへこませたり息を止めたりしない",
      "equipment": "マット",
      "gates": "G6",
      "pose": "側面。中間位保持、骨盤動作なし。腹圧を誤って腹筋起こしで描かない",
      "image": "images/T21.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "仰向け膝立て中間位、腹筋起こしなし。呼吸と軽い力は文で指定。",
      "clinicalStatus": "pending_review",
      "sha256": "ed19770feb2d8f504132a40aae22e24788a4179fc46582e7c87b1aa61e4adde6"
    },
    "T22": {
      "id": "T22",
      "key": "v02_T22",
      "name": "仰向けで腕だけ動かす",
      "purpose": "体幹制御",
      "steps": [
        "仰向けで両足を床につけ、片腕を頭側へ動かして戻します。"
      ],
      "doseProposal": "C：左右各5回",
      "caution": "腰が反る前まで。脚を同時に動かさない",
      "equipment": "マット",
      "gates": "G6",
      "pose": "斜め側面。両膝立て足床、片腕のみ胸前→頭側。T11と区別",
      "image": "images/T22.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両足接地のまま左腕のみ頭側へ、脚不動。",
      "clinicalStatus": "pending_review",
      "sha256": "4e17d47241ef9bf1875369061e26b627df0d485858e05e11772a3e81e763c4d8"
    },
    "T23": {
      "id": "T23",
      "key": "v02_T23",
      "name": "四つ這いで脚を滑らせる",
      "purpose": "短レバー制御",
      "steps": [
        "四つ這いから片足を後ろへ滑らせて戻します。"
      ],
      "doseProposal": "C：左右各5回",
      "caution": "つま先は床につけ、腰を反らさない",
      "equipment": "マット",
      "gates": "G6",
      "pose": "側面。両手支持、片膝が伸びつま先は接地。脚を浮かせない",
      "image": "images/T23.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両手支持、後方へ脚を伸ばしつま先接地。",
      "clinicalStatus": "pending_review",
      "sha256": "eaccfe56571ad6a3968fadcb0943a3424394b80bccbc5d65d7366e2f1c784b06"
    },
    "N01": {
      "id": "N01",
      "key": "v02_N01",
      "name": "首を楽にして呼吸",
      "purpose": "力み軽減",
      "steps": [
        "背を支えて座り、肩の力を抜いてゆっくり呼吸します。"
      ],
      "doseProposal": "C：5呼吸×2",
      "caution": "頭を後ろへ倒さない",
      "equipment": "背もたれ椅子",
      "gates": "G0",
      "pose": "側面。前腕支持、頭部楽な中間位",
      "image": "images/N01.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "背もたれと前腕支持、頭中間位。",
      "clinicalStatus": "pending_review",
      "sha256": "558d1a8f4f5633606be4ae35b962618e09a0d7f9ffcd3bca274f175bb55b9dc7"
    },
    "N02": {
      "id": "N02",
      "key": "v02_N02",
      "name": "首を小さく左右へ向ける",
      "purpose": "回旋ROM",
      "steps": [
        "正面から顔をゆっくり左右へ向け、戻します。"
      ],
      "doseProposal": "R：左右各5回",
      "caution": "めまい・しびれなら中止。手でねじらない",
      "equipment": "椅子",
      "gates": "G5該当時",
      "pose": "正面と斜め上。体幹固定、頚部小回旋。大きな円運動なし",
      "image": "images/N02.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "体幹正面固定で頚部左回旋例、両側運動に整合。",
      "clinicalStatus": "pending_review",
      "sha256": "bc2e045511b7d365aa0d6664ab45efc0c81951baafbc85b17bb66a187ea1cde3"
    },
    "N03": {
      "id": "N03",
      "key": "v02_N03",
      "name": "首を小さく横へ傾ける",
      "purpose": "側屈ROM",
      "steps": [
        "肩を上げず、耳を肩へ少し近づけて戻します。"
      ],
      "doseProposal": "R：左右各5回",
      "caution": "腕症状を誘発する側へ押し込まない",
      "equipment": "椅子",
      "gates": "G5該当時",
      "pose": "正面。肩水平、頚部の小側屈、手で頭を引かない",
      "image": "images/N03.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "肩概ね水平で小側屈、手で引かない。",
      "clinicalStatus": "pending_review",
      "sha256": "437af47534d2d09b9bb5a23fb553330fb0e8ffd098699a8546c1f8e3318137d7"
    },
    "N04": {
      "id": "N04",
      "key": "v02_N04",
      "name": "仰向けの小さなうなずき",
      "purpose": "頚部制御",
      "steps": [
        "仰向けで頭を支え、小さく「はい」とうなずきます。"
      ],
      "doseProposal": "C：3秒×5回",
      "caution": "頭を持ち上げず、顎を強く引かない",
      "equipment": "薄い枕",
      "gates": "G0",
      "pose": "側面。後頭部は枕上、上位頚椎の小屈曲",
      "image": "images/N04.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "後頭部枕上でうなずき、頭持上げなし。",
      "clinicalStatus": "pending_review",
      "sha256": "9d8c333422ed72f97d362f8f8df6c901e4d585fbb533c95b4d8430a8ba901b1f"
    },
    "N05": {
      "id": "N05",
      "key": "v02_N05",
      "name": "うなずきを短く保つ",
      "purpose": "頚部持久力",
      "steps": [
        "仰向けで頭を支え、小さく「はい」とうなずきます。",
        "N04の姿勢で小さくうなずき、その位置を短く保ちます。"
      ],
      "doseProposal": "C：5秒×5回",
      "caution": "首前面を強く力ませない",
      "equipment": "薄い枕",
      "gates": "G0",
      "pose": "N04保持variant。頭部挙上なし",
      "image": "images/N05.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "枕上保持で頭持上げなし、保持時間は文。",
      "clinicalStatus": "pending_review",
      "sha256": "b1df69867065683494a314b8e02848c07d1f758894f6f2205fa16a4060f6176e",
      "baseExerciseId": "N04"
    },
    "N06": {
      "id": "N06",
      "key": "v02_N06",
      "name": "首を横へ軽く押す",
      "purpose": "頚部等尺性",
      "steps": [
        "手を頭の横に当て、頭と手で軽く押し合います。"
      ],
      "doseProposal": "I：左右各5回",
      "caution": "頭を動かさず、最大努力なし",
      "equipment": "なし",
      "gates": "G5該当時",
      "pose": "正面。右掌は右側頭部、左右の対向力のみ",
      "image": "images/N06.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右手側頭部接触・頭正面静止、抵抗力は文。",
      "clinicalStatus": "pending_review",
      "sha256": "102dff3eef8cd36e7c95a8747af876f82bbcfcd4a359e9b737b324217225fbb2"
    },
    "N07": {
      "id": "N07",
      "key": "v02_N07",
      "name": "首を回さず軽く押す",
      "purpose": "回旋等尺性",
      "steps": [
        "手を頬の横に当て、顔を向けようとする力を軽く受け止めます。"
      ],
      "doseProposal": "I：左右各5回",
      "caution": "顎関節を強く押さえない",
      "equipment": "なし",
      "gates": "G5該当時",
      "pose": "斜め上。手が頬の側面で回旋抵抗、頚部は動かない",
      "image": "images/N07.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右手頬側面・頭正面静止、強い圧の有無は静止画では不可。",
      "clinicalStatus": "pending_review",
      "sha256": "83edb816ed2e9fa91375e920ce673d8279b92e107e4e63a6b815dc69a415ab84"
    },
    "N08": {
      "id": "N08",
      "key": "v02_N08",
      "name": "視線を保つ腕上げ",
      "purpose": "頚肩協調",
      "steps": [
        "正面を見て、両腕を痛くない高さへ上げて戻します。"
      ],
      "doseProposal": "C：5〜8回",
      "caution": "首が反る高さまで上げない",
      "equipment": "なし",
      "gates": "G1該当時",
      "pose": "側面。顔は正面、腕胸高まで、肩すくめの誇張なし",
      "image": "images/N08.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両腕胸高・顔正面・首過伸展なし。",
      "clinicalStatus": "pending_review",
      "sha256": "28570604c2c3987f3c303b4fdf98d4869ec3fdf13f0d31ddd581900468fa6b0e"
    },
    "N09": {
      "id": "N09",
      "key": "v02_N09",
      "name": "四つ這いで首を保つ",
      "purpose": "頚部持久力",
      "steps": [
        "四つ這いになり、首を背中の自然な延長に保ちます。"
      ],
      "doseProposal": "C：5〜10秒×3",
      "caution": "顔を上げて正面を見ない。手首痛なら除外",
      "equipment": "マット",
      "gates": "G0",
      "pose": "側面。視線床、顎軽く引く。過伸展/深屈曲なし",
      "image": "images/N09.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "四つ這い四肢支持、床視線・頚部自然な延長。",
      "clinicalStatus": "pending_review",
      "sha256": "93970694606831adf7c7fe4b9925d3edf5d53dd6bebc8c5face770a680319e75"
    },
    "N10": {
      "id": "N10",
      "key": "v02_N10",
      "name": "座位で腕を前へ伸ばす",
      "purpose": "作業耐性",
      "steps": [
        "首を楽に保ち、机の上で両手を前へ伸ばして戻します。"
      ],
      "doseProposal": "C：5〜8回",
      "caution": "1姿勢を固定し続けず休息を入れる",
      "equipment": "椅子、机",
      "gates": "G0",
      "pose": "側面。両前腕支持→前方リーチ、頭部過前突なし",
      "image": "images/N10.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両前腕机上から前方リーチ、頭過前突目立たず。",
      "clinicalStatus": "pending_review",
      "sha256": "bdcced5c3c3536b469384b3c9221ef3e44efbfe17f70ff79cb58af9c1fef7a8c"
    },
    "K01": {
      "id": "K01",
      "key": "v02_K01",
      "name": "膝を伸ばすストレッチ",
      "purpose": "伸展ROM",
      "steps": [
        "仰向けで右かかとの下にタオルを置き、膝の力を抜いて伸ばします。"
      ],
      "doseProposal": "S",
      "caution": "膝上に重りを置かない。術後の伸展制限を優先",
      "equipment": "タオル、ベッド等",
      "gates": "G4該当時",
      "pose": "右側面。かかと支持、膝裏は支えなし。強制的な過伸展なし",
      "image": "images/K01.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "手前右踵タオル・膝裏別支持なし。左右適合。",
      "clinicalStatus": "pending_review",
      "sha256": "4272bd9620898e70ffdab21be4c520118c5787c903b6497824cb64b9510fab1f"
    },
    "K02": {
      "id": "K02",
      "key": "v02_K02",
      "name": "かかと滑らせ",
      "purpose": "屈曲ROM",
      "steps": [
        "仰向けで右かかとをお尻へ滑らせ、戻します。"
      ],
      "doseProposal": "R",
      "caution": "許可された角度まで。引っかかりを押し切らない",
      "equipment": "マット、滑るタオル可",
      "gates": "G4該当時",
      "pose": "側面。かかと接地、膝伸展→屈曲。空中で自転車こぎにしない",
      "image": "images/K02.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "手前右踵がタオル上を滑り膝屈曲。左右適合。奥脚終末は遮蔽。",
      "clinicalStatus": "pending_review",
      "sha256": "b36fc546859683f979af3e918b28f382bdc5031a4a210fb93bef71775173eeff"
    },
    "K03": {
      "id": "K03",
      "key": "v02_K03",
      "name": "太ももに力を入れる",
      "purpose": "四頭筋活動",
      "steps": [
        "膝の下の薄いタオルを軽く押すように、太ももへ力を入れます。"
      ],
      "doseProposal": "I",
      "caution": "臀部を持ち上げない。「かかとが浮くほど力まない」を必須条件にしない",
      "equipment": "薄いタオル",
      "gates": "G4該当時",
      "pose": "側面。膝下タオル、四頭筋収縮。かかと強制接地の矢印なし",
      "image": "images/K03.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右膝下薄タオル・臀部接地。収縮力は文で補足。",
      "clinicalStatus": "pending_review",
      "sha256": "cb722e828defa8cd1a8697ea23a6465d4ff3b6e32a178c35b8871e4a182dd1dd"
    },
    "K04": {
      "id": "K04",
      "key": "v02_K04",
      "name": "膝を伸ばして脚上げ",
      "purpose": "伸展保持",
      "steps": [
        "左膝を立て、右膝を伸ばして脚を少し持ち上げ、戻します。"
      ],
      "doseProposal": "M：5〜8回から",
      "caution": "膝が曲がるならK03/K05へ。腰痛増悪なら中止",
      "equipment": "マット",
      "gates": "G4該当時",
      "pose": "側面。左足床、右膝伸展保持で20〜30cm挙上。高すぎない",
      "image": "images/K04.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右膝伸展挙上・左膝屈曲足床、左右適合。",
      "clinicalStatus": "pending_review",
      "sha256": "40a391992cc7d795b6468f0891fd27baf463c824ab28a9b7902363b6d5407faf"
    },
    "K05": {
      "id": "K05",
      "key": "v02_K05",
      "name": "椅子で膝伸ばし",
      "purpose": "四頭筋筋力",
      "steps": [
        "椅子に座り、右膝をゆっくり伸ばして戻します。"
      ],
      "doseProposal": "M：重りなし",
      "caution": "反動をつけない。許可範囲内",
      "equipment": "椅子",
      "gates": "G4該当時",
      "pose": "右側面。大腿座面支持、膝約90°→許可伸展。足首を重りで縛らない",
      "image": "images/K05.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右大腿座面支持、右膝屈伸・左足床、重りなし。",
      "clinicalStatus": "pending_review",
      "sha256": "cbf522d6935816fd79ea96d8bb50082d0e5f5e2a90bab8a1d7eed795d85fc52e"
    },
    "K06": {
      "id": "K06",
      "key": "v02_K06",
      "name": "椅子から立つ・座る",
      "purpose": "立ち座り",
      "steps": [
        "足を床につき、椅子から立ってゆっくり座ります。"
      ],
      "doseProposal": "M：5〜8回から",
      "caution": "必要なら肘掛け使用。椅子は動かないもの",
      "equipment": "安定椅子",
      "gates": "G4該当時",
      "pose": "側面。座位→体を少し前へ→立位。後方に倒れない足位置",
      "image": "images/K06.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "椅子上前傾から立位、足位置成立。",
      "clinicalStatus": "pending_review",
      "sha256": "ac0ceaa99b5bae07b4584706ce0d3e0471f169a04189bfdd34a5bd541038c5e0"
    },
    "K07": {
      "id": "K07",
      "key": "v02_K07",
      "name": "支え付き浅いスクワット",
      "purpose": "荷重筋力",
      "steps": [
        "台へ手を添え、お尻を後ろへ引いて浅くしゃがみ、戻します。"
      ],
      "doseProposal": "M",
      "caution": "膝の角度はPT指定。痛みを我慢して深くしない",
      "equipment": "頑丈な支持台",
      "gates": "G4該当時",
      "pose": "前斜め。両手支持、股膝軽い屈曲、踵接地",
      "image": "images/K07.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両手支持・浅い股膝屈曲・踵接地。",
      "clinicalStatus": "pending_review",
      "sha256": "6d1e2cff2566bebddd8657151b9c26d5d6ba4da3f7d465dd5b99b7474742aff2"
    },
    "K08": {
      "id": "K08",
      "key": "v02_K08",
      "name": "両脚のかかと上げ",
      "purpose": "下腿筋力",
      "steps": [
        "台へ手を添え、両かかとを上げてゆっくり戻します。"
      ],
      "doseProposal": "M",
      "caution": "足首を大きく外へ倒さない",
      "equipment": "支持台",
      "gates": "G4該当時",
      "pose": "後斜め。両前足部支持、踵の垂直移動",
      "image": "images/K08.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両前足部で踵上げ、両手支持・足首外倒し目立たず。",
      "clinicalStatus": "pending_review",
      "sha256": "c136f824a3698309048bfb2b946028aaeb6a2ef65570acccb2f6ad17a04de245"
    },
    "K09": {
      "id": "K09",
      "key": "v02_K09",
      "name": "低い段に上がる",
      "purpose": "階段昇段",
      "steps": [
        "手すりを持ち、右足を低い段に乗せて体を上げます。左足を先に床へ戻します。"
      ],
      "doseProposal": "M：5〜8回、段は5〜10cmからPT指定",
      "caution": "段は固定。右脚支持で安全に戻れなければ別運動",
      "equipment": "固定段、手すり",
      "gates": "G4+G8",
      "pose": "右前斜め。右足段上、左足床→両足段→左足床。上り下りの先行足を明示",
      "image": "images/K09.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右足段上→両足→左足床、手すり一貫。",
      "clinicalStatus": "pending_review",
      "sha256": "55bba7b6a3f6d20dbd913feeb1b1de4bb6953d4133f8029c836ef59ffb81db1b"
    },
    "K10": {
      "id": "K10",
      "key": "v02_K10",
      "name": "横歩き",
      "purpose": "股関節と歩行",
      "steps": [
        "台のそばで、横へ小さく歩きます。反対向きにも戻ります。"
      ],
      "doseProposal": "M：各方向5歩×2",
      "caution": "足を交差させない",
      "equipment": "支持台沿いの空間",
      "gates": "G4該当時",
      "pose": "正面。足を交差しない横移動、軽い膝屈曲。バンドなし",
      "image": "images/K10.png",
      "imageCaption": "台へ手を添え、小さく横へ移動して戻ります。",
      "assetStatus": "説明補強",
      "assetNotes": "非交差の横開き追い足、机支持適合。背景に対する全身移動小さく説明補強。",
      "clinicalStatus": "pending_review",
      "sha256": "6eca509b8135f8209a46a8c126484f89b6b6c9641da0f34bc761fad5998bd219"
    },
    "K11": {
      "id": "K11",
      "key": "v02_K11",
      "name": "支え付き片脚立ち",
      "purpose": "バランス",
      "steps": [
        "台に手を添え、右脚で立って左足を少し浮かせます。"
      ],
      "doseProposal": "B",
      "caution": "支持を外すことを目標にし過ぎない",
      "equipment": "固定支持台",
      "gates": "G4該当時",
      "pose": "正面。右足床、左足わずかに浮く、手は台へ",
      "image": "images/K11.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右足支持・左足少し浮き・右手台、整合。",
      "clinicalStatus": "pending_review",
      "sha256": "631bfe8435aa1ee9e16c453ef1da53b92b830a6d77ddf61e7b0345ffffeeb549"
    },
    "K12": {
      "id": "K12",
      "key": "v02_K12",
      "name": "重り付き膝伸ばし",
      "purpose": "四頭筋負荷",
      "steps": [
        "椅子に座り、右膝をゆっくり伸ばして戻します。",
        "K05の動きを、指定された足首の重りで行います。"
      ],
      "doseProposal": "M：負荷量を処方",
      "caution": "抵抗だけを増やし、勢いをつけない",
      "equipment": "椅子、安全な足首重り",
      "gates": "G4該当時",
      "pose": "K05の抵抗variant。足首重りの位置明瞭",
      "image": "images/K12.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右足首重りのK05動作、大腿支持。",
      "clinicalStatus": "pending_review",
      "sha256": "920d4855f4c3335e949a4d7ed508cf54dfe208e0ed389cfd4df77cc3e9de3cd4",
      "baseExerciseId": "K05"
    },
    "K13": {
      "id": "K13",
      "key": "v02_K13",
      "name": "低い段からかかとを下ろす",
      "purpose": "階段下降",
      "steps": [
        "右足で段に立ち、手すりを持ちます。左かかとを床へ軽く触れさせ、戻します。"
      ],
      "doseProposal": "M：5〜8回、段高PT指定",
      "caution": "右膝の角度・荷重制限を守る",
      "equipment": "固定段、手すり",
      "gates": "G4+G8",
      "pose": "正面斜め。右足は段に残る、左踵床へ。左脚へ完全に乗り換えない",
      "image": "images/K13.png",
      "imageCaption": "右足を段に残し、左かかとを床へ軽く触れさせて戻します。",
      "assetStatus": "修正後採用候補",
      "assetNotes": "生成後実見：奥右足が段上、手前左踵が床へ、手すり支持。2コマの変化は小さく、下降と戻しは本文併用。左右例示は適合。",
      "clinicalStatus": "pending_review",
      "sha256": "68711ba4ee46d05fa2ddc3c4c86907521212d0bb8c3fff6f31b582fd5be1274c"
    },
    "K14": {
      "id": "K14",
      "key": "v02_K14",
      "name": "前後開きの浅いしゃがみ",
      "purpose": "下肢筋力",
      "steps": [
        "台へ手を添え、足を前後に開きます。体を少し下げて戻します。"
      ],
      "doseProposal": "M：左右各5〜8回から",
      "caution": "歩幅と深さは無理なく。膝を床へつける必要なし",
      "equipment": "支持台",
      "gates": "G4該当時",
      "pose": "側面。右足前、左足後、両足その場、前膝軽い屈曲",
      "image": "images/K14.png",
      "imageCaption": "指定された脚の位置で、小さく膝を曲げて戻します。前後の脚の位置は担当者と確認してください。",
      "assetStatus": "説明補強",
      "assetNotes": "開始右脚後ろに見えるが終末との左右追跡不確実。目的は支持付き浅い前後開きスクワットに適合。",
      "clinicalStatus": "pending_review",
      "sha256": "c1e8e0661137f869e2f13fa63c594853f3107709a73ec9e675089c131a68fd8e"
    },
    "K15": {
      "id": "K15",
      "key": "v02_K15",
      "name": "支え付き片脚の浅いしゃがみ",
      "purpose": "片脚制御",
      "steps": [
        "台を持って右脚で立ち、浅くしゃがんで戻します。"
      ],
      "doseProposal": "M：5〜8回",
      "caution": "膝折れや痛みなら両脚へ戻す",
      "equipment": "支持台",
      "gates": "G4該当時",
      "pose": "前斜め。右脚荷重、左足浮く、両手支持。深屈曲なし",
      "image": "images/K15.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右脚荷重・左足浮き・両手支持・浅い屈曲。",
      "clinicalStatus": "pending_review",
      "sha256": "57e5b02628cdb1f5deb71f971ef4313536ebdfcfca1de137bb6d169fd117d7ab"
    },
    "K16": {
      "id": "K16",
      "key": "v02_K16",
      "name": "支え付き片脚かかと上げ",
      "purpose": "下腿筋力",
      "steps": [
        "台へ手を添え、右脚のかかとを上げて戻します。"
      ],
      "doseProposal": "M：5〜8回から",
      "caution": "高さが出なければ両脚へ",
      "equipment": "支持台",
      "gates": "G4該当時",
      "pose": "後斜め。右前足部支持、左足浮く、踵垂直挙上",
      "image": "images/K16.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右前足部支持・左足浮き、両手台、踵上げ。",
      "clinicalStatus": "pending_review",
      "sha256": "efd0e61e2f7cafe786b366034d9b59024e932c4cf007ff510cd59f52bbc30929"
    },
    "K17": {
      "id": "K17",
      "key": "v02_K17",
      "name": "ゴム付き横歩き",
      "purpose": "股外転負荷",
      "steps": [
        "膝より上にゴムをつけ、足幅を保って横へ小さく歩きます。"
      ],
      "doseProposal": "M：各方向5歩×2",
      "caution": "足首へのゴム変更は別負荷。足を交差しない",
      "equipment": "ゴム、安全な空間",
      "gates": "G4該当時+G8",
      "pose": "正面。バンドは大腿遠位の膝より上、両足を開いたまま横移動",
      "image": "images/K17.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "膝上バンドと非交差の開く・追う連続。横移動量は静止画から未確定。",
      "clinicalStatus": "pending_review",
      "sha256": "258321ef16bb355df6d0db2d6e41da42dd2edeac7fc6379321aff015448810b0"
    },
    "K18": {
      "id": "K18",
      "key": "v02_K18",
      "name": "支え付き片脚ヒンジ",
      "purpose": "股関節・片脚制御",
      "steps": [
        "台へ手を添え、右脚で立ちます。お尻を後ろへ引いて体を少し倒し、戻します。"
      ],
      "doseProposal": "M：5〜8回",
      "caution": "最初は左つま先を床につける退行可。腰をねじらない",
      "equipment": "支持台",
      "gates": "G4該当時",
      "pose": "右側面。右膝軽屈曲、左脚は後方、右股関節屈曲。手支持明瞭",
      "image": "images/K18.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右脚支持で股関節から前傾し左脚を後方へ。手支持と四肢の連続性を確認。",
      "clinicalStatus": "pending_review",
      "sha256": "c548bc054fb3e8d78430dd98550f60953b4762dd925e4ed4cdcdf3febed9368b"
    },
    "K19": {
      "id": "K19",
      "key": "v02_K19",
      "name": "支え付き脚の横上げ",
      "purpose": "股外転筋力",
      "steps": [
        "台へ手を添え、右脚を少し横へ動かし、戻します。"
      ],
      "doseProposal": "M",
      "caution": "体を横へ倒さず小さな範囲",
      "equipment": "支持台",
      "gates": "G4該当時",
      "pose": "正面。左脚支持、右股外転、足先ほぼ前向き。腰の反りなし",
      "image": "images/K19.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "左脚支持・左手台支持で右脚を外へ。体幹の大きな側屈なし。",
      "clinicalStatus": "pending_review",
      "sha256": "b85377df3779674270e1c3467d70c0584219a196d8d31d010ab696cb0e784411"
    },
    "K20": {
      "id": "K20",
      "key": "v02_K20",
      "name": "短い歩行",
      "purpose": "歩行持久力",
      "steps": [
        "平らで安全な場所を、楽に話せる速さで歩きます。必要なら途中で休みます。"
      ],
      "doseProposal": "W：1〜2分に分割可",
      "caution": "杖等は指示通り。跛行や脚症状の増悪を押し切らない",
      "equipment": "普段の歩行補助具",
      "gates": "G4該当時",
      "pose": "側面。平地の歩行1周期。杖variantは実際の指示と一致",
      "image": "images/K20.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右向き歩行。手前右腕は前方、手前右大腿は奥脚を覆って後方へ連続し踵が浮く。奥左脚が前方接踵。同側腕脚前方という旧判定は支持しない。",
      "clinicalStatus": "pending_review",
      "sha256": "1a06bafc23039706bdad0cbf7c546175c9953933ef227bc1372165325f626905"
    },
    "K21": {
      "id": "K21",
      "key": "v02_K21",
      "name": "室内自転車",
      "purpose": "低衝撃有酸素",
      "steps": [
        "足が無理なく回る高さに座り、軽い抵抗でこぎます。"
      ],
      "doseProposal": "W：3〜5分から",
      "caution": "膝が曲がる許可角度内。乗降安全も確認",
      "equipment": "固定式自転車",
      "gates": "G4該当時+G8",
      "pose": "側面。サドル高で最大屈曲を調整、深屈曲を強制しない",
      "image": "images/K21.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "自転車の足とペダルの対応は自然。機器に隠れた奥脚を欠損とは判定しない。個別の膝屈曲許容範囲は図から確定不可。",
      "clinicalStatus": "pending_review",
      "sha256": "1054d93c36efbae0c1f28ce65cacbf66223470e20bd2b2fea32cac1b621b43b5"
    },
    "K22": {
      "id": "K22",
      "key": "v02_K22",
      "name": "歩行と休みのくり返し",
      "purpose": "歩行量の拡大",
      "steps": [
        "指示された時間歩き、椅子で休むことをくり返します。"
      ],
      "doseProposal": "W：歩行1分＋休息1分×3から",
      "caution": "症状が戻るのを待つ。決めた時刻で無理に再開しない",
      "equipment": "安全な道、椅子",
      "gates": "G0",
      "pose": "歩行と椅子休息の2コマ。連続歩行の競争表現なし",
      "image": "images/K22.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "歩行と椅子休息を表示。四肢連続性と対角の腕振りを確認。",
      "clinicalStatus": "pending_review",
      "sha256": "3ccf9f104fc33aab172dc63180a23c69bfdb6163539ca593f2b58bc9c64b7cd2"
    },
    "K23": {
      "id": "K23",
      "key": "v02_K23",
      "name": "支え付き重心移動",
      "purpose": "荷重練習",
      "steps": [
        "両手で台を持ち、左右の脚へ少しずつ体重を移します。"
      ],
      "doseProposal": "C：左右各5回",
      "caution": "免荷・部分荷重ならその具体指示を優先",
      "equipment": "支持台",
      "gates": "G4",
      "pose": "正面。両足接地のまま小さな左右移動。片脚へ全荷重の図にしない",
      "image": "images/K23.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両手台支持・両足接地の小さな荷重移動。静止画で移動量は確定不可。",
      "clinicalStatus": "pending_review",
      "sha256": "b5c68272526d7dc3e6fa85bc052a8d46cb089c011e9a416166f12a5d5eec1abd"
    },
    "K24": {
      "id": "K24",
      "key": "v02_K24",
      "name": "前後に足を並べて歩く",
      "purpose": "歩行バランス",
      "steps": [
        "台のそばで、足を少し前後に並べながらゆっくり歩きます。"
      ],
      "doseProposal": "B：5歩×2往復",
      "caution": "最初は一直線でなく少し足幅を残す。介助が必要なら単独不可",
      "equipment": "長い支持台",
      "gates": "G4該当時",
      "pose": "正面。セミタンデム歩行、手支持。閉眼や不安定面なし",
      "image": "images/K24.png",
      "imageCaption": "",
      "assetStatus": "修正後採用候補",
      "assetNotes": "生成後実見：10 cmと寸法線が消え、左右交互のセミタンデムと手すり支持が維持。足幅の固定値なし。",
      "clinicalStatus": "pending_review",
      "sha256": "b8e8e74fcd827d2cb18279e3aeb9b069890996d413c8967101cd980f2553aa86"
    },
    "E01": {
      "id": "E01",
      "key": "v02_E01",
      "name": "手首を反らす力入れ",
      "purpose": "伸筋等尺性",
      "steps": [
        "右前腕を机に置き、右手の甲を左手へ軽く押し当てます。"
      ],
      "doseProposal": "I",
      "caution": "痛みを減らす保証はない。増悪時は力を下げる",
      "equipment": "机",
      "gates": "G0",
      "pose": "右側面。前腕回内、右手背に左掌、伸展方向の力のみ",
      "image": "images/E01.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右前腕を台で支持し左手が右手背を押さえる。手首ほぼ中間位。",
      "clinicalStatus": "pending_review",
      "sha256": "b06bc997a924d7010a6f6f790c91a0860b1469bc2e5237b120251568939dea3b"
    },
    "E02": {
      "id": "E02",
      "key": "v02_E02",
      "name": "手首の曲げ伸ばし",
      "purpose": "ROM",
      "steps": [
        "前腕を机に置き、手首をゆっくり曲げ伸ばしします。"
      ],
      "doseProposal": "R",
      "caution": "指を強く握らず楽に動かす",
      "equipment": "机",
      "gates": "G0",
      "pose": "側面。右手首だけ机端から出し、小屈伸",
      "image": "images/E02.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右前腕と肘を台支持、手首のみ屈伸。四肢の対応は連続。",
      "clinicalStatus": "pending_review",
      "sha256": "e40ae13158f67540aad063229a59a9ffe3b200fbcd5bf63bc0586789a0dc9180"
    },
    "E03": {
      "id": "E03",
      "key": "v02_E03",
      "name": "手のひら返し",
      "purpose": "回内外ROM",
      "steps": [
        "肘を体側で曲げ、手のひらを上・下へゆっくり返します。"
      ],
      "doseProposal": "R",
      "caution": "肩ごと回さない",
      "equipment": "なし",
      "gates": "G0",
      "pose": "正面斜め。肘90°体側、回外→回内。手首橈尺屈でない",
      "image": "images/E03.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右肘体側で曲げたまま手掌を上・下に返す。投影による角度差を異常とは判定しない。",
      "clinicalStatus": "pending_review",
      "sha256": "09e428489f7a9af39332346c24fa226a41ca29a5a46cf022f06cd875c28ae1d6"
    },
    "E04": {
      "id": "E04",
      "key": "v02_E04",
      "name": "前腕の軽いストレッチ",
      "purpose": "柔軟性",
      "steps": [
        "右前腕を支え、左手で右手首を少し曲げます。"
      ],
      "doseProposal": "S：10秒×2から",
      "caution": "指先のしびれ・外側肘痛なら除外。肘完全伸展を強制しない",
      "equipment": "机",
      "gates": "G0",
      "pose": "側面。右前腕回内、肘軽屈曲、左手が手背を軽く屈曲",
      "image": "images/E04.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "手前右前腕を支持し奥左手が右手背を軽く曲げる。肘の完全伸展なし。",
      "clinicalStatus": "pending_review",
      "sha256": "ee652f9bb186c8c4db0f1b9e7f3c18e57d78f23919a4cece72536f8c494d1915"
    },
    "E05": {
      "id": "E05",
      "key": "v02_E05",
      "name": "タオルを軽く握る",
      "purpose": "握りの再開",
      "steps": [
        "丸めたタオルを右手で軽く握り、ゆっくり緩めます。"
      ],
      "doseProposal": "I",
      "caution": "最大握力を出さない",
      "equipment": "タオル",
      "gates": "G0",
      "pose": "手の接写と肘の位置。手首ほぼ中間位、強い屈曲なし",
      "image": "images/E05.png",
      "imageCaption": "",
      "assetStatus": "修正後採用候補",
      "assetNotes": "生成後実見：奥側の解剖学的右手でタオルを保持、手前左手は左大腿上。両コマで同側、手首ほぼ中間位。小さな握りの差は本文併用。",
      "clinicalStatus": "pending_review",
      "sha256": "999f4c508bfa413c4fd3dda573e7382816b4db03f3f37dfef92faa6ab6fc495e"
    },
    "E06": {
      "id": "E06",
      "key": "v02_E06",
      "name": "重りで手首を反らす",
      "purpose": "伸筋抵抗運動",
      "steps": [
        "前腕を机に置き、軽い重りを持って手首を上げ、ゆっくり下ろします。"
      ],
      "doseProposal": "M",
      "caution": "上げ下げ両方を制御。痛みが増すなら軽くする",
      "equipment": "机、軽い重り",
      "gates": "G0",
      "pose": "側面。前腕回内、手首のみ屈曲から伸展。肘は動かさない",
      "image": "images/E06.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "前腕回内・机支持を保ち手首のみ屈曲から伸展。",
      "clinicalStatus": "pending_review",
      "sha256": "af30231a82f84490a35a3e254911e8656969cb8a835a4663af7b444d1ef3155d"
    },
    "E07": {
      "id": "E07",
      "key": "v02_E07",
      "name": "助けて上げてゆっくり下ろす",
      "purpose": "伸筋の下降負荷",
      "steps": [
        "左手で右手首を持ち上げるのを助け、右手だけでゆっくり下ろします。"
      ],
      "doseProposal": "M：5〜8回、下降約3秒",
      "caution": "E06の代替候補。両方を必須にしない",
      "equipment": "机、軽い重り",
      "gates": "G0",
      "pose": "3コマ。左手介助上げ→左手離す→右手下降。左手が常に支え続けない",
      "image": "images/E07.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "3コマで左手介助、手を離す、右手単独下降を確認。介助手は最終コマで隠れるが常時支えていない。",
      "clinicalStatus": "pending_review",
      "sha256": "f13fb4ed8544a1a84cfb466a04d18ce4c4d7e902c28fc992e444cacaa65e9407"
    },
    "E08": {
      "id": "E08",
      "key": "v02_E08",
      "name": "軽い棒を回す",
      "purpose": "回内外筋力",
      "steps": [
        "肘を体側で曲げ、短く持った軽い棒をゆっくり上・下へ回します。"
      ],
      "doseProposal": "M：5〜8回",
      "caution": "長く持つほど負荷増。長さ・重量を処方",
      "equipment": "軽い棒または短レバー重り",
      "gates": "G0",
      "pose": "正面斜め。肘90°固定、棒の重心は手に近い。勢いを使わない",
      "image": "images/E08.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右肘体側で棒を回内外。短い木棒の把持位置は手に近い重心として読める。",
      "clinicalStatus": "pending_review",
      "sha256": "fbc9aa47ef36b3b00e47be8a7fb5da0cb7a0b3ea7697c53c7f71f47f26daf919"
    },
    "E09": {
      "id": "E09",
      "key": "v02_E09",
      "name": "手首を保って軽く握る",
      "purpose": "保持耐性",
      "steps": [
        "前腕を机に置き、手首をまっすぐに保ってタオルを短く握ります。"
      ],
      "doseProposal": "C：5〜10秒×5",
      "caution": "握りを強くするより症状と保持を確認",
      "equipment": "机、タオル",
      "gates": "G0",
      "pose": "手首中間位の静止。E05との違いは支持と保持時間",
      "image": "images/E09.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "前腕机支持で中間位の手首とタオル保持。左右指定はなく左手例示でも矛盾なし。",
      "clinicalStatus": "pending_review",
      "sha256": "de33bd46fdcc9040e272e4dfab8c3a1abd14937c2f844ab1724756b55036c8bf"
    },
    "E10": {
      "id": "E10",
      "key": "v02_E10",
      "name": "少し重くして手首を反らす",
      "purpose": "伸筋負荷の漸増",
      "steps": [
        "前腕を机に置き、軽い重りを持って手首を上げ、ゆっくり下ろします。",
        "E06と同じ動きを、担当者が決めた重さで行います。"
      ],
      "doseProposal": "M",
      "caution": "重量だけを段階調整。回数・頻度も同時に増やさない",
      "equipment": "机、指定重り",
      "gates": "G0",
      "pose": "E06の負荷variant。手首角度は同じ",
      "image": "images/E10.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "E06と同様の支持・手首運動。重量を数値で固定していない。",
      "clinicalStatus": "pending_review",
      "sha256": "6754f812c1b6341a44bbfb7c0c3b5219aa805034da0a8c1a71389012073e217e",
      "baseExerciseId": "E06"
    },
    "A01": {
      "id": "A01",
      "key": "v02_A01",
      "name": "足首の上下運動",
      "purpose": "底背屈ROM",
      "steps": [
        "座って脚を支え、つま先をゆっくり上・下へ動かします。"
      ],
      "doseProposal": "R",
      "caution": "強い底屈や内返しを加えない",
      "equipment": "椅子、脚支持",
      "gates": "G4該当時",
      "pose": "側面。踵支持、足関節底背屈のみ、円軌道なし",
      "image": "images/A01.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "脚・踵支持の足関節底背屈。底屈終点で踵の接触が弱く見えるが支持台上であり円運動や内返しではない。",
      "clinicalStatus": "pending_review",
      "sha256": "e6f91b1ba78eef1bbcec3ae48faa97b6a8263954a7e10166aea30cec9a7a05bf"
    },
    "A02": {
      "id": "A02",
      "key": "v02_A02",
      "name": "座位でかかとを滑らせる",
      "purpose": "背屈ROM",
      "steps": [
        "椅子に座り、かかとを床につけたまま足を少し手前へ引きます。"
      ],
      "doseProposal": "R",
      "caution": "前足部や外くるぶしの痛みで止める",
      "equipment": "椅子",
      "gates": "G4該当時",
      "pose": "側面。右足底接地、踵が手前へ、足関節背屈。膝も許可範囲",
      "image": "images/A02.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "手前右足底接地で椅子側へ少し引く。踵の接地と後方向矢印を確認。",
      "clinicalStatus": "pending_review",
      "sha256": "f5bc5b29f8359fd4323ce2cdbc9b7750b12fd386cc542c9c1b62adf9e0f77a66"
    },
    "A03": {
      "id": "A03",
      "key": "v02_A03",
      "name": "足裏を軽く縮める",
      "purpose": "足部制御",
      "steps": [
        "足裏を床につけ、指を丸めず土踏まずを少し持ち上げます。"
      ],
      "doseProposal": "I",
      "caution": "指で床を強くつかまない",
      "equipment": "椅子",
      "gates": "G0",
      "pose": "内側接写。踵と母趾球接地、趾は伸びたまま、内側縦アーチ小挙上",
      "image": "images/A03.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "踵と前足部を接地し趾の強い屈曲なく小さなアーチ挙上。接写で動きの小ささを確認。",
      "clinicalStatus": "pending_review",
      "sha256": "065c4e0636b00592406c832653d98ff0ee5e05fef4cd820d0584075f06141d31"
    },
    "A04": {
      "id": "A04",
      "key": "v02_A04",
      "name": "足を外へ軽く押す",
      "purpose": "外反等尺性",
      "steps": [
        "座って右足の外側を固定した支えへ軽く押します。"
      ],
      "doseProposal": "I",
      "caution": "膝や脚全体を外へ回さない",
      "equipment": "安定したクッション付き支え",
      "gates": "G4該当時",
      "pose": "正面足部。右外側に抵抗、外反方向の力のみ。内返しの矢印なし",
      "image": "images/A04.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "正面で右足外側（画面左）に壁固定クッション。膝は前向き、内返し矢印なし。",
      "clinicalStatus": "pending_review",
      "sha256": "87dc65eed3df337ecbabba9908cf1172e881ebfcc8bf651550cc76ed2913fe01"
    },
    "A05": {
      "id": "A05",
      "key": "v02_A05",
      "name": "座ってかかと上げ",
      "purpose": "下腿筋活動",
      "steps": [
        "椅子に座り、つま先を床につけたまま両かかとを上げます。"
      ],
      "doseProposal": "M：重りなし",
      "caution": "足の外側だけに乗らない",
      "equipment": "椅子",
      "gates": "G4該当時",
      "pose": "側面。両膝約90°、座位保持、両踵のみ上",
      "image": "images/A05.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "座位・両前足部接地で両踵を挙上。外側だけに偏る描写はない。",
      "clinicalStatus": "pending_review",
      "sha256": "7963e339e38f8d54ec38e9fc1dfbf61a912d80a65e7d9aabe00c6e0f3b02d89f"
    },
    "A06": {
      "id": "A06",
      "key": "v02_A06",
      "name": "壁へ膝を近づける",
      "purpose": "荷重背屈",
      "steps": [
        "壁に手を添え、右かかとを床につけて右膝を少し前へ動かします。"
      ],
      "doseProposal": "R：5〜10回",
      "caution": "踵が浮く前まで。荷重許可後",
      "equipment": "壁",
      "gates": "G4",
      "pose": "側面。右足前、右膝前方へ、踵接地。壁との距離は個別設定",
      "image": "images/A06.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "手前右脚が前、踵接地のまま右膝を壁へ。距離を数値固定していない。",
      "clinicalStatus": "pending_review",
      "sha256": "f2b0bd1af0b34220b075adedf05f94e31b1c77a231765829595bd665ce2c976c"
    },
    "A07": {
      "id": "A07",
      "key": "v02_A07",
      "name": "ゴムで足を外へ",
      "purpose": "外反筋力",
      "steps": [
        "右足先にかけたゴムの抵抗に逆らい、足先を少し外へ動かして戻します。"
      ],
      "doseProposal": "M",
      "caution": "ゴムは足から抜けない位置。膝は前向き",
      "equipment": "ゴム、安全な内側固定点",
      "gates": "G4+G8",
      "pose": "足側上方。右足の内側にアンカー、外反でゴム伸長。左右固定方向を検査",
      "image": "images/A07.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "右足先のバンドが内側（画面右）固定点へ連続。右足は外方へ、膝は前向き。",
      "clinicalStatus": "pending_review",
      "sha256": "e9beaa5efbdf8b7544a3c95e1ac65040286941f098d021de316c9b8e74dff3b1"
    },
    "A08": {
      "id": "A08",
      "key": "v02_A08",
      "name": "支え付き片脚リーチ",
      "purpose": "動的バランス",
      "steps": [
        "右脚で立ち台へ手を添えます。左つま先を前・横・後ろへ軽く触れて戻します。"
      ],
      "doseProposal": "B：各方向3回",
      "caution": "右膝・足首の許可範囲。遠さを競わない",
      "equipment": "支持台、床の印",
      "gates": "G4",
      "pose": "上方斜め。右足固定、左つま先3方向。跳躍なし",
      "image": "images/A08.png",
      "imageCaption": "図は左つま先を横へ触れる例です。右脚で支え、左つま先を前・横・後ろへ軽く触れて戻します。",
      "assetStatus": "説明補強",
      "assetNotes": "右脚と右手で支持、左つま先の横リーチとして適合。前・後リーチは図にないため本文で3方向を説明する必要。",
      "clinicalStatus": "pending_review",
      "sha256": "bafaf034f6b4655651ba1caa36d71f73e018f298adaf71f584fdaf349d310576"
    },
    "A09": {
      "id": "A09",
      "key": "v02_A09",
      "name": "低い障害物をまたぐ",
      "purpose": "生活場面の歩行",
      "steps": [
        "手すりを持ち、低い目印をゆっくりまたぎます。"
      ],
      "doseProposal": "B：左右先行各5回",
      "caution": "硬い高い障害物不可。転倒不安が強ければ監督下",
      "equipment": "手すり、柔らかい低い目印",
      "gates": "G4+G8",
      "pose": "側面。低いフォーム材、手支持、片足ずつ通過",
      "image": "images/A09.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "手すり支持で低い柔らかい目印を片足ずつ通過。高い硬い障害物や跳躍ではない。",
      "clinicalStatus": "pending_review",
      "sha256": "d9f776054b94527561a7f4fe80a5c039a299be8a88fb83aa92e2aa1273166fba"
    },
    "A10": {
      "id": "A10",
      "key": "v02_A10",
      "name": "支え付き足踏み",
      "purpose": "支持脚の切替",
      "steps": [
        "台へ手を添え、その場でゆっくり左右交互に足踏みします。"
      ],
      "doseProposal": "C：左右各10回",
      "caution": "急がず、膝を高く上げる必要なし",
      "equipment": "支持台",
      "gates": "G4",
      "pose": "正面。左右交互の小さな足浮上、手支持。走る図にしない",
      "image": "images/A10.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "台支持のまま右・左を交互に小さく挙上。走行や高い腿上げではない。",
      "clinicalStatus": "pending_review",
      "sha256": "e10b3cc4564064f75628e46f33ebd9854e8c318e978dd0bcb34b9a537b5e03ca"
    },
    "P01": {
      "id": "P01",
      "key": "v02_P01",
      "name": "壁への軽い両手パス",
      "purpose": "上肢の素早い力発揮",
      "steps": [
        "胸の前から柔らかい軽い球を壁へ押し出し、両手で受けます。"
      ],
      "doseProposal": "P：5回×2、間60秒",
      "caution": "重いメディシンボールではない。肩痛・不安感なら中止",
      "equipment": "安全な壁、軽い球、空間",
      "gates": "G2該当時+G7+G8",
      "pose": "側面。両手胸前→肘伸ばす短いパス→両手受球。頭上投げにしない",
      "image": "images/P01.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両手胸前パス・肘伸展・両手受球。重さと速度は静止画では保証不可。",
      "clinicalStatus": "pending_review",
      "sha256": "c6387361d7ab432bc3993a3490b248e5774780fb6c0fcdd44830f3b90a3a70ef"
    },
    "P02": {
      "id": "P02",
      "key": "v02_P02",
      "name": "短距離の軽い投球",
      "purpose": "投球の再導入",
      "steps": [
        "担当者が指定した距離・球数・強さで、相手へ軽く投げます。"
      ],
      "doseProposal": "P：球数・距離・強度・休息の4値は個別計画必須、共通値なし",
      "caution": "医師/PTの投球許可、前段階の耐性を確認。痛み・脱臼感で中止",
      "equipment": "球、相手、安全な投球場所",
      "gates": "G1+G2+G3該当時+G7+G8",
      "pose": "右投げ開始→リリース→フォロー。片腕のみの誤った省略不可。動画優先・汎用画像だけでフォーム指導しない",
      "image": null,
      "imageCaption": "",
      "assetStatus": "個別条件待ち",
      "assetNotes": "距離・球数・強度・休息、投球許可の個別条件待ち。画像生成しない。",
      "clinicalStatus": "pending_review",
      "sha256": null,
      "status": "retired"
    },
    "P03": {
      "id": "P03",
      "key": "v02_P03",
      "name": "ゆっくりした素振り",
      "purpose": "反復スイングの再導入",
      "steps": [
        "指定された用具を軽く握り、ゆっくり小さく素振りします。"
      ],
      "doseProposal": "P：5回×2、間60秒、速度と範囲はPT指定",
      "caution": "ボールを打つ負荷は別許可。肘の痛みが増すなら中止",
      "equipment": "競技用具、安全な空間",
      "gates": "G7+G8",
      "pose": "右利きの小さなフォア側素振り2コマ。競技種別と利き手のvariant必須",
      "image": null,
      "imageCaption": "",
      "assetStatus": "個別条件待ち",
      "assetNotes": "競技種別・利き手・速度・範囲の個別条件待ち。画像生成しない。",
      "clinicalStatus": "pending_review",
      "sha256": null,
      "status": "retired"
    },
    "P04": {
      "id": "P04",
      "key": "v02_P04",
      "name": "両脚の小さなジャンプ",
      "purpose": "衝撃再導入",
      "steps": [
        "両足で少し跳び、静かに着地して一度止まります。"
      ],
      "doseProposal": "P：5回×2、間60秒",
      "caution": "翌日の腫れ・痛みも確認。連続跳びにしない",
      "equipment": "滑らない平地",
      "gates": "G4+G6該当時+G7",
      "pose": "正面斜め。両足離地→両足着地、股膝屈曲で止まる。台から落とさない",
      "image": "images/P04.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "両足の小さな離地から両足接地・股膝屈曲。静止と反復間休止は本文併用。",
      "clinicalStatus": "pending_review",
      "sha256": "489514741c03bd1835b1644fac96be4f728321669c6e0977390ccd6441c56976"
    },
    "P05": {
      "id": "P05",
      "key": "v02_P05",
      "name": "片脚の小さなホップ",
      "purpose": "片脚衝撃耐性",
      "steps": [
        "右脚で小さく跳び、同じ右脚で着地して止まります。"
      ],
      "doseProposal": "P：指定側3回×2、間60秒",
      "caution": "両脚着地と片脚支持が許容されてから。痛みや膝折れで中止",
      "equipment": "平地、近くに監督者",
      "gates": "G4+G7",
      "pose": "前斜め。右足離地→右足着地、左足は終始浮く",
      "image": "images/P05.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "手前右足で離地・着地、奥左足は終始後方浮上。四肢の連続性あり。",
      "clinicalStatus": "pending_review",
      "sha256": "f45f75cd725eb1f40052c98082fd1a78749191b42c11a42680248ffe091c72c2"
    },
    "P06": {
      "id": "P06",
      "key": "v02_P06",
      "name": "小さな前跳びから止まる",
      "purpose": "着地制御",
      "steps": [
        "両足で少し前へ跳び、両足で着地して2秒静止します。"
      ],
      "doseProposal": "P：3回×2、間60秒",
      "caution": "距離より止まれる範囲。段差からのドロップではない",
      "equipment": "平地、床印",
      "gates": "G4+G6該当時+G7",
      "pose": "側面3コマ。小前方跳躍→両脚股膝屈曲→2秒静止",
      "image": "images/P06.png",
      "imageCaption": "両足で少し前へ跳び、両足で着地して2秒止まります。",
      "assetStatus": "説明補強",
      "assetNotes": "両足小前跳躍と屈曲着地は適合。2秒静止は図だけで読めないため本文併用。",
      "clinicalStatus": "pending_review",
      "sha256": "5b770d03ec368bd48c00a829005783c6c3b1a9dfa6ba479d7fd98f17f8d82e89"
    },
    "P07": {
      "id": "P07",
      "key": "v02_P07",
      "name": "軽い走りから止まる",
      "purpose": "減速",
      "steps": [
        "指定された短い距離を軽く走り、歩幅を小さくして止まります。"
      ],
      "doseProposal": "P：5m程度×3本から、距離・速度はPT指定",
      "caution": "直線走の許可後。急停止や全力走をさせない",
      "equipment": "広い安全な平地",
      "gates": "G4該当時+G6該当時+G7+G8",
      "pose": "側面。低速走→複数歩で減速→停止。1歩で急停止の図にしない",
      "image": "images/P07.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "4段階で軽走→減速→歩幅を小さく→停止。複数歩で減速する意図が明確。",
      "clinicalStatus": "pending_review",
      "sha256": "9d12ad818f0cc72839aaffa888c74563cd6938569e96867e04baa00472f258f1"
    },
    "P08": {
      "id": "P08",
      "key": "v02_P08",
      "name": "決めた向きへ曲がる",
      "purpose": "方向転換",
      "steps": [
        "軽く進み、あらかじめ決めた向きへ小さく曲がります。"
      ],
      "doseProposal": "P：左右各3回から、角度・速度はPT指定",
      "caution": "直線減速を確認後。急な合図への反応は別段階",
      "equipment": "床印、広い平地",
      "gates": "G4該当時+G6該当時+G7+G8",
      "pose": "斜め上。低速で約30°の予定コース。固定足上の急な膝ねじりでない",
      "image": "images/P08.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "予定された緩い曲線を数歩で進む。急な固定足上の捻りを描いていない。正確な角度・速度は本文に従う。",
      "clinicalStatus": "pending_review",
      "sha256": "57741b004b5862174877e2187dabcf38b5042acc9ee26a3adee016cd5ef4e7ca"
    },
    "P09": {
      "id": "P09",
      "key": "v02_P09",
      "name": "歩きと軽い走りの交互",
      "purpose": "ラン再開",
      "steps": [
        "指示された時間だけ歩きと軽い走りを交互に行います。"
      ],
      "doseProposal": "P：歩行1分＋軽走30秒×3から、医療者が確定",
      "caution": "走行許可後。痛み・跛行・翌日悪化で戻す",
      "equipment": "平らな安全なコース",
      "gates": "G6該当時+G7+G8",
      "pose": "歩行→軽走の2コマ。傾斜や全力走なし",
      "image": "images/P09.png",
      "imageCaption": "",
      "assetStatus": "採用候補",
      "assetNotes": "歩行と軽走の2コマ。対角の腕振り、四肢連続性に問題を認めない。時間と負荷は本文併用。",
      "clinicalStatus": "pending_review",
      "sha256": "528c851cf514ee600ade7143a3e5450dc07ffb7c881f75055a1c3fb2491c4371"
    },
    "P10": {
      "id": "P10",
      "key": "v02_P10",
      "name": "胸を開く動きの再導入",
      "purpose": "伸展・回旋への復帰準備",
      "steps": [
        "担当者と確認した小さな範囲で、体を伸ばす動きと回す動きを別々に行います。"
      ],
      "doseProposal": "P：各方向3回から。方向・範囲・肢位は個別入力必須",
      "caution": "分離症の許可後。いきなり伸展＋回旋を同時に強く行わない",
      "equipment": "必要な支持物",
      "gates": "G6+G7",
      "pose": "個別肢位が決まるまで画像生成保留。共通の大きな反り・ひねり画像は不可。医療者の実演動画仕様を使用",
      "image": null,
      "imageCaption": "",
      "assetStatus": "個別条件待ち",
      "assetNotes": "方向・範囲・肢位の個別条件待ち。共通画像を生成しない。",
      "clinicalStatus": "pending_review",
      "sha256": null,
      "status": "retired"
    },
    "S30": {
      "id": "S30",
      "key": "v02_S30",
      "name": "ゴムで肩を内に回す",
      "purpose": "肩を内に回す筋力",
      "steps": [
        "右横の安全な固定点のゴムを右手で持ちます。右肘を体側で曲げ、右手をお腹の前へ引いて、ゆっくり戻します。"
      ],
      "doseProposal": "M：8回×1セット（個別調整用の開始案）",
      "caution": "肘を体から離さず、痛みのない範囲で。肩の抵抗運動の許可を確認します。",
      "equipment": "軽いゴム、専用固定点",
      "gates": "G1+G8",
      "pose": "正面。右肘体側90°、固定点は右側方腰高、前腕が腹側へ",
      "image": "images/S30.png",
      "imageCaption": "肘を体の横で保ち、前腕をお腹側へ回します。ゴムの固定点と抵抗の強さは担当者と確認してください。",
      "assetStatus": "生成画像・姿勢確認済み",
      "assetNotes": "AI生成後に支持面・左右・動作方向を目視照合。動きの量と条件は本文・担当者の指示を併用。臨床承認を意味しない。",
      "clinicalStatus": "pending_review",
      "sha256": "fecdd92336d87089f3005dd3755b4a55f31e2f4051eaa155f298e70ff87e9181",
      "addedIn": "0.3",
      "evidenceRefs": [
        "R5",
        "R6"
      ]
    },
    "S37": {
      "id": "S37",
      "key": "v02_S37",
      "name": "膝つき腕立てで肩甲骨を押し出す",
      "purpose": "肩甲骨まわりの筋力と腕の支持",
      "steps": [
        "両手と両膝で支え、頭から膝まで一直線に近づけます。肘を伸ばしたまま床を軽く押して、肩甲骨を前へ動かし戻します。"
      ],
      "doseProposal": "M：5回×1セット（個別調整用の開始案）",
      "caution": "壁押しが安定してから。肩や手首が痛む場合は壁押しに戻します。腰を落とさないでください。",
      "equipment": "マット",
      "gates": "G1",
      "pose": "側面。膝つき腕立て、肘伸展一定、肩甲骨の小さな前方突出",
      "image": "images/S37.png",
      "imageCaption": "両手と両膝で支えます。肘を曲げる腕立てではなく、肘を伸ばしたまま肩甲骨を動かします。",
      "assetStatus": "生成画像・姿勢確認済み",
      "assetNotes": "AI生成後に支持面・左右・動作方向を目視照合。動きの量と条件は本文・担当者の指示を併用。臨床承認を意味しない。",
      "clinicalStatus": "pending_review",
      "sha256": "1b34a9b5987b371c1f0d36b2a73cbc9dcbdbc10e18b988ca312a8c7b219f1306",
      "addedIn": "0.3",
      "evidenceRefs": [
        "R5",
        "R16"
      ]
    },
    "N12": {
      "id": "N12",
      "key": "v02_N12",
      "name": "首を前後に軽く押す",
      "purpose": "首の前後の筋力",
      "steps": [
        "額に手を当て、頭を動かさず軽く押し合い、力を抜きます。後頭部でも同じように行います。息を止めないでください。"
      ],
      "doseProposal": "I：5秒保持×5回×1セット（個別調整用の開始案）",
      "caution": "強く押しすぎず、めまい・腕のしびれ・痛みが増える場合は中止します。",
      "equipment": "なし",
      "gates": "G5該当時",
      "pose": "正面と側面。手掌が額／後頭部、頭部静止",
      "image": "images/N12.png",
      "imageCaption": "額と後頭部で、それぞれ手と頭を軽く押し合います。頭は動かさず、息を止めません。",
      "assetStatus": "生成画像・姿勢確認済み",
      "assetNotes": "AI生成後に支持面・左右・動作方向を目視照合。動きの量と条件は本文・担当者の指示を併用。臨床承認を意味しない。",
      "clinicalStatus": "pending_review",
      "sha256": "2908dfb6eb0cdc16ccf600456a61816a2bc5cf5c14d545ffeadc849a7a4ae750",
      "addedIn": "0.3",
      "evidenceRefs": [
        "R9"
      ]
    },
    "T25": {
      "id": "T25",
      "key": "v02_T25",
      "name": "膝つきプランク",
      "purpose": "体幹の前面を支える持久力",
      "steps": [
        "前腕と膝で体を支え、頭から膝まで一直線に近づけます。そのまま自然に呼吸します。"
      ],
      "doseProposal": "C：10秒保持×3回×1セット（個別調整用の開始案）",
      "caution": "腰を反らさず、息を止めないでください。肩・膝・腰が痛む場合は中止します。",
      "equipment": "マット",
      "gates": "G5該当時+G6該当時",
      "pose": "側面。前腕・膝支持、体幹一直線",
      "image": "images/T25.png",
      "imageCaption": "前腕と膝で支え、腰を反らさず自然に呼吸します。保持時間は処方の指示に従ってください。",
      "assetStatus": "生成画像・姿勢確認済み",
      "assetNotes": "AI生成後に支持面・左右・動作方向を目視照合。動きの量と条件は本文・担当者の指示を併用。臨床承認を意味しない。",
      "clinicalStatus": "pending_review",
      "sha256": "d98a629857e6ea68f6b1a2940665c094d95c3cecc539049d8ea914a0fac5d94a",
      "addedIn": "0.3",
      "evidenceRefs": [
        "R3"
      ]
    },
    "T26": {
      "id": "T26",
      "key": "v02_T26",
      "name": "プランク",
      "purpose": "体幹の前面を支える持久力",
      "steps": [
        "前腕とつま先で体を支え、頭からかかとまで一直線に近づけます。そのまま自然に呼吸します。"
      ],
      "doseProposal": "C：10秒保持×3回×1セット（個別調整用の開始案）",
      "caution": "膝つきプランクが安定してから。腰が反る・息が止まる場合は膝つきに戻します。",
      "equipment": "マット",
      "gates": "G5該当時+G6該当時",
      "pose": "側面。前腕・つま先支持、体幹一直線",
      "image": "images/T26.png",
      "imageCaption": "前腕とつま先で支えます。腰が落ちる前に終え、難しい場合は膝つきに戻します。",
      "assetStatus": "生成画像・姿勢確認済み",
      "assetNotes": "AI生成後に支持面・左右・動作方向を目視照合。動きの量と条件は本文・担当者の指示を併用。臨床承認を意味しない。",
      "clinicalStatus": "pending_review",
      "sha256": "79b4dc21c1fc3bb8c03ed0eb2b4e005737ba009330ea864ecd98343ac93fab51",
      "addedIn": "0.3",
      "evidenceRefs": [
        "R3"
      ]
    },
    "K26": {
      "id": "K26",
      "key": "v02_K26",
      "name": "横向きで脚を上げる",
      "purpose": "股関節の横の筋力",
      "steps": [
        "左を下に寝て、下側の膝を軽く曲げます。上の右脚を伸ばしたまま少し持ち上げ、ゆっくり戻します。つま先を正面に向けます。"
      ],
      "doseProposal": "M：8回×1セット（個別調整用の開始案）",
      "caution": "骨盤を後ろへ倒さず、腰を反らさないでください。手術後は運動の許可を確認します。",
      "equipment": "マット",
      "gates": "G4該当時+G6該当時",
      "pose": "正面。側臥位、上側脚の外転、骨盤垂直",
      "image": "images/K26.png",
      "imageCaption": "図は右脚の例です。下側の膝を曲げ、上の脚は伸ばして少し上げます。骨盤を後ろに倒さないでください。",
      "assetStatus": "生成画像・姿勢確認済み",
      "assetNotes": "AI生成後に支持面・左右・動作方向を目視照合。動きの量と条件は本文・担当者の指示を併用。臨床承認を意味しない。",
      "clinicalStatus": "pending_review",
      "sha256": "dcb0bf5190066d9918c9d794c77b5be397799e5919258410c3fd8c84d3f1efc4",
      "addedIn": "0.3",
      "evidenceRefs": [
        "R4",
        "R8"
      ]
    },
    "K38": {
      "id": "K38",
      "key": "v02_K38",
      "name": "早歩きと普通歩きのくり返し",
      "purpose": "歩く持久力",
      "steps": [
        "安全な平地で、会話ができる程度に少し速く1分歩きます。その後、楽な速さで2分歩きます。これをくり返します。"
      ],
      "doseProposal": "W：3分×2セット（個別調整用の開始案）",
      "caution": "短い歩行が安定してから。脚の症状が増えたら休み、翌日まで悪化が残る場合は量を減らします。",
      "equipment": "安全な歩行路",
      "gates": "G4該当時",
      "pose": "側面。早歩きのストライドと腕振り",
      "image": "images/K38.png",
      "imageCaption": "左は少し速い歩行、右は楽な歩行の例です。走らず、時間とセット数は処方の指示に従ってください。",
      "assetStatus": "生成画像・姿勢確認済み",
      "assetNotes": "AI生成後に支持面・左右・動作方向を目視照合。動きの量と条件は本文・担当者の指示を併用。臨床承認を意味しない。",
      "clinicalStatus": "pending_review",
      "sha256": "e8bd1236b179eedbe7b27d17c83708f181844002b2aad493275a88121fbddbc6",
      "addedIn": "0.3",
      "evidenceRefs": [
        "R4",
        "R18"
      ]
    },
    "A11": {
      "id": "A11",
      "key": "v02_A11",
      "name": "ゴムでつま先を上げる",
      "purpose": "足首を上げる筋力",
      "steps": [
        "座ってかかとを支え、右足先のゴムを前方の安全な固定点に固定します。右つま先を手前に引き、ゆっくり戻します。"
      ],
      "doseProposal": "M：8回×1セット（個別調整用の開始案）",
      "caution": "脚全体を引かず、痛みのない範囲で。ゴムが外れないことを確認します。",
      "equipment": "ゴム、前方の固定点",
      "gates": "G4該当時+G8",
      "pose": "側面。座位、右足背にゴム、足関節背屈",
      "image": "images/A11.png",
      "imageCaption": "図は右足の例です。かかとを支えたまま、つま先を手前へ引きます。ゴムの固定を確認してください。",
      "assetStatus": "生成画像・姿勢確認済み",
      "assetNotes": "AI生成後に支持面・左右・動作方向を目視照合。動きの量と条件は本文・担当者の指示を併用。臨床承認を意味しない。",
      "clinicalStatus": "pending_review",
      "sha256": "b56d43a767337408b4200bce538dcc9c1c45f61ea3a4a8617bb4038f752a4030",
      "addedIn": "0.3",
      "evidenceRefs": [
        "R14"
      ]
    },
    "A13": {
      "id": "A13",
      "key": "v02_A13",
      "name": "ゴムでつま先を下げる",
      "purpose": "足首を下げる筋力",
      "steps": [
        "座って右足裏にゴムをかけ、両手で持ちます。膝の位置を保ち、右つま先を前へ押してゆっくり戻します。"
      ],
      "doseProposal": "M：8回×1セット（個別調整用の開始案）",
      "caution": "足首を内へ倒さず、ゴムが外れないように持ちます。抵抗運動の許可範囲で行います。",
      "equipment": "ゴム",
      "gates": "G4該当時",
      "pose": "側面。長座、足底にゴム、底屈",
      "image": "images/A13.png",
      "imageCaption": "図は右足の例です。ゴムを両手で保ち、足首を内へ倒さずつま先を前へ押します。",
      "assetStatus": "生成画像・姿勢確認済み",
      "assetNotes": "AI生成後に支持面・左右・動作方向を目視照合。動きの量と条件は本文・担当者の指示を併用。臨床承認を意味しない。",
      "clinicalStatus": "pending_review",
      "sha256": "1b212d5dece207bea331983a2ee2e025fa0fcc2935005e3b1e62be3dfb7a10ce",
      "addedIn": "0.3",
      "evidenceRefs": [
        "R14"
      ]
    },
    "A15": {
      "id": "A15",
      "key": "v02_A15",
      "name": "支えなしで片脚リーチ",
      "purpose": "動きながらのバランス",
      "steps": [
        "すぐ手が届く台の横で右脚に立ちます。左つま先を前・横・後ろへ、姿勢を保てる範囲で触れて戻します。"
      ],
      "doseProposal": "B：3回×1セット（個別調整用の開始案）",
      "caution": "支え付きリーチが安定してから。ふらついたら台につかまり、無理に遠くへ伸ばさないでください。",
      "equipment": "床の印、近くの支持台",
      "gates": "G4",
      "pose": "上方。右脚支持、左つま先3方向、手は腰",
      "image": "images/A15.png",
      "imageCaption": "図は右脚で支える例です。動かす足は前・横・後ろへ。ふらついたらすぐ台につかまります。",
      "assetStatus": "生成画像・姿勢確認済み",
      "assetNotes": "AI生成後に支持面・左右・動作方向を目視照合。動きの量と条件は本文・担当者の指示を併用。臨床承認を意味しない。",
      "clinicalStatus": "pending_review",
      "sha256": "d317eab603b7dee2368aea43ef2a824c8c7b36bfd4f6b20d8a12799c021d29d0",
      "addedIn": "0.3",
      "evidenceRefs": [
        "R14",
        "R15"
      ]
    },
    "P12": {
      "id": "P12",
      "key": "v02_P12",
      "name": "左右に小さく跳ぶ",
      "purpose": "横方向の両脚着地",
      "steps": [
        "床の線をはさんで、両足で左右に小さく跳び、静かに着地します。不安定な場合は毎回止まります。"
      ],
      "doseProposal": "P：6回×2セット（個別調整用の開始案）",
      "caution": "初回は担当者と確認し、両脚ジャンプが安定してから。痛み・腫れ・不安定感があれば中止します。",
      "equipment": "床の線",
      "gates": "G4+G7",
      "pose": "正面。両足で線の左右へ跳躍",
      "image": "images/P12.png",
      "imageCaption": "左右への小さな両脚跳びです。片道の着地で1回と数えます。着地が不安定なら毎回止まります。",
      "assetStatus": "生成画像・姿勢確認済み",
      "assetNotes": "AI生成後に支持面・左右・動作方向を目視照合。動きの量と条件は本文・担当者の指示を併用。臨床承認を意味しない。",
      "clinicalStatus": "pending_review",
      "sha256": "0d3cddf550c3b8e3bbf3615639c543e501523830c1f4c8c515161d50273a8fa0",
      "addedIn": "0.3",
      "evidenceRefs": [
        "R23",
        "R24"
      ]
    },
    "P13": {
      "id": "P13",
      "key": "v02_P13",
      "name": "横に跳んで片脚で止まる",
      "purpose": "横方向の片脚着地と減速",
      "steps": [
        "左脚から短い距離を右へ跳び、右脚で着地して2秒止まります。反対側も同じように行います。"
      ],
      "doseProposal": "P：2秒保持×3回×2セット（個別調整用の開始案）",
      "caution": "初回は担当者と確認。片脚ホップと両脚横跳びが安定してから。止まれない距離へ跳ばないでください。",
      "equipment": "平地",
      "gates": "G4+G7",
      "pose": "正面。左→右の横跳び、右脚片脚着地・股膝屈曲",
      "image": "images/P13.png",
      "imageCaption": "左右それぞれ、片脚で着地して2秒止まります。距離は担当者と確認し、止まれる短い距離から始めます。",
      "assetStatus": "生成画像・姿勢確認済み",
      "assetNotes": "AI生成後に支持面・左右・動作方向を目視照合。動きの量と条件は本文・担当者の指示を併用。臨床承認を意味しない。",
      "clinicalStatus": "pending_review",
      "sha256": "d268a5e5ef109f5cf21791ea6f33f50bfb89ec2c1e4e2f26571396d01bb2803d",
      "addedIn": "0.3",
      "evidenceRefs": [
        "R14",
        "R23"
      ]
    }
  },
  "categories": {
    "G01": {
      "id": "G01",
      "name": "一般：五十肩（肩関節周囲炎）",
      "notes": "疼痛刺激性と拘縮を区別。強い夜間痛ではストレッチを増やさない",
      "levels": {
        "beginner": [
          "S01",
          "S02",
          "S03",
          "S04",
          "S05"
        ],
        "intermediate": [
          "S08",
          "S09",
          "S10",
          "S11",
          "S12",
          "S13"
        ],
        "advanced": [
          "S14",
          "S15",
          "S16",
          "S17",
          "S18",
          "S19"
        ]
      }
    },
    "G02": {
      "id": "G02",
      "name": "一般：腰痛",
      "notes": "本書は非特異的腰痛を想定。骨折等の特異的疾患を除外",
      "levels": {
        "beginner": [
          "T01",
          "T02",
          "T03",
          "T04",
          "T05",
          "K20"
        ],
        "intermediate": [
          "T06",
          "T07",
          "T08",
          "T09",
          "T10",
          "K07",
          "T25",
          "K38"
        ],
        "advanced": [
          "T11",
          "T12",
          "T13",
          "T14",
          "K14",
          "K18",
          "T26"
        ]
      }
    },
    "G03": {
      "id": "G03",
      "name": "一般：膝OA",
      "notes": "ROM、膝伸展筋力、歩行、立ち座り・階段を優先",
      "levels": {
        "beginner": [
          "K01",
          "K02",
          "K03",
          "K04",
          "K05",
          "T08"
        ],
        "intermediate": [
          "K06",
          "K07",
          "K08",
          "K09",
          "K10",
          "K11",
          "K26"
        ],
        "advanced": [
          "K12",
          "K13",
          "K14",
          "K15",
          "K16",
          "K17",
          "K38"
        ]
      }
    },
    "G04": {
      "id": "G04",
      "name": "一般：テニス肘",
      "notes": "前腕負荷の調整が主。肩運動だけの処方にしない",
      "levels": {
        "beginner": [
          "E01",
          "E02",
          "E03",
          "E04",
          "E05",
          "S05"
        ],
        "intermediate": [
          "E06",
          "E07",
          "E08",
          "E09",
          "S12",
          "S13"
        ],
        "advanced": [
          "E10",
          "E08",
          "E09",
          "S20",
          "S21",
          "S22"
        ]
      }
    },
    "G05": {
      "id": "G05",
      "name": "一般：頚椎症",
      "notes": "脊髄症・進行性神経障害の評価。ROMの無理な終末域運動なし",
      "levels": {
        "beginner": [
          "N01",
          "N02",
          "N03",
          "N04",
          "S05",
          "T15"
        ],
        "intermediate": [
          "N05",
          "N06",
          "N07",
          "N08",
          "S12",
          "S13",
          "N12"
        ],
        "advanced": [
          "N09",
          "N10",
          "S14",
          "S15",
          "S22",
          "K20"
        ]
      }
    },
    "G06": {
      "id": "G06",
      "name": "一般：肩インピンジメント",
      "notes": "臨床評価上の腱板関連肩痛を想定。既存診断名を勝手に変更せず別名表示を検討",
      "levels": {
        "beginner": [
          "S02",
          "S05",
          "S07",
          "T15",
          "S11"
        ],
        "intermediate": [
          "S08",
          "S09",
          "S10",
          "S12",
          "S13",
          "S15",
          "S30"
        ],
        "advanced": [
          "S14",
          "S16",
          "S17",
          "S18",
          "S20",
          "S21",
          "S37"
        ]
      }
    },
    "G07": {
      "id": "G07",
      "name": "一般：腱板断裂",
      "notes": "全層/部分・外傷性・保存/術後を確認。急な挙上不能は運動候補選びより再評価",
      "levels": {
        "beginner": [
          "S01",
          "S02",
          "S03",
          "S04",
          "S05",
          "S23"
        ],
        "intermediate": [
          "S08",
          "S09",
          "S10",
          "S11",
          "S12",
          "S15",
          "S30"
        ],
        "advanced": [
          "S14",
          "S16",
          "S17",
          "S18",
          "S19",
          "S21",
          "S37"
        ]
      }
    },
    "G08": {
      "id": "G08",
      "name": "一般：頚椎椎間板ヘルニア",
      "notes": "G5。頭頚部方向運動や神経滑走はデフォルト処方から除外",
      "levels": {
        "beginner": [
          "N01",
          "N02",
          "N03",
          "N04",
          "T15",
          "K20"
        ],
        "intermediate": [
          "N05",
          "N06",
          "N07",
          "N08",
          "S12",
          "S13",
          "N12"
        ],
        "advanced": [
          "N09",
          "N10",
          "S14",
          "S15",
          "S22",
          "K20"
        ]
      }
    },
    "G09": {
      "id": "G09",
      "name": "一般：肩関節前方脱臼後",
      "notes": "G1/G2。再脱臼歴・骨性病変・術後制限を確認",
      "levels": {
        "beginner": [
          "S23",
          "S05",
          "S02",
          "S04",
          "S07"
        ],
        "intermediate": [
          "S08",
          "S09",
          "S10",
          "S11",
          "S12",
          "S13",
          "S30"
        ],
        "advanced": [
          "S14",
          "S15",
          "S18",
          "S20",
          "S21",
          "S22",
          "S37"
        ]
      }
    },
    "G10": {
      "id": "G10",
      "name": "一般：SLAP損傷",
      "notes": "G1/G3。二頭筋負荷は下限量でも許可なしに開始しない",
      "levels": {
        "beginner": [
          "S23",
          "S05",
          "S02",
          "S04",
          "S07"
        ],
        "intermediate": [
          "S08",
          "S09",
          "S10",
          "S11",
          "S12",
          "S13",
          "S30"
        ],
        "advanced": [
          "S14",
          "S15",
          "S17",
          "S18",
          "S21",
          "S24"
        ]
      }
    },
    "G11": {
      "id": "G11",
      "name": "一般：腰部脊柱管狭窄症",
      "notes": "立位・歩行症状と休息姿勢を評価。屈曲で改善する人だけ屈曲運動を選択",
      "levels": {
        "beginner": [
          "T01",
          "T02",
          "T16",
          "K05",
          "K20",
          "K21"
        ],
        "intermediate": [
          "T06",
          "T08",
          "K06",
          "K08",
          "K09",
          "K19",
          "K26"
        ],
        "advanced": [
          "T09",
          "T10",
          "K10",
          "K11",
          "K13",
          "K22",
          "K38"
        ]
      }
    },
    "G12": {
      "id": "G12",
      "name": "一般：腰椎椎間板ヘルニア",
      "notes": "G5。全員に伸展または屈曲を指定しない",
      "levels": {
        "beginner": [
          "T01",
          "T02",
          "T17",
          "T18",
          "K20",
          "T10"
        ],
        "intermediate": [
          "T06",
          "T07",
          "T08",
          "T09",
          "K06",
          "K07"
        ],
        "advanced": [
          "T11",
          "T12",
          "T14",
          "K14",
          "K18",
          "T19",
          "T26"
        ]
      }
    },
    "G13": {
      "id": "G13",
      "name": "一般：外側足関節捻挫",
      "notes": "G4。骨折・高位捻挫等の疑いは診療へ",
      "levels": {
        "beginner": [
          "A01",
          "A02",
          "A03",
          "A04",
          "A05",
          "K23",
          "A11"
        ],
        "intermediate": [
          "A06",
          "A07",
          "K08",
          "K11",
          "K09",
          "K24",
          "A13"
        ],
        "advanced": [
          "K16",
          "K13",
          "K14",
          "A08",
          "A09",
          "A10",
          "A15"
        ]
      }
    },
    "G14": {
      "id": "G14",
      "name": "一般：半月板損傷",
      "notes": "G4。保存/切除/縫合/根修復等を分離。荷重と深屈曲制限を確認",
      "levels": {
        "beginner": [
          "K01",
          "K02",
          "K03",
          "K04",
          "K05",
          "T08"
        ],
        "intermediate": [
          "K06",
          "K07",
          "K08",
          "K09",
          "K10",
          "K11",
          "K26"
        ],
        "advanced": [
          "K12",
          "K13",
          "K14",
          "K15",
          "K16",
          "K18"
        ]
      }
    },
    "A01": {
      "id": "A01",
      "name": "競技：腱板関連肩痛",
      "notes": "競技の上肢負荷と翌日反応を含める",
      "levels": {
        "beginner": [
          "S02",
          "S05",
          "S07",
          "S11",
          "T15"
        ],
        "intermediate": [
          "S08",
          "S09",
          "S10",
          "S12",
          "S14",
          "S15",
          "S30"
        ],
        "advanced": [
          "S25",
          "S17",
          "S20",
          "S26",
          "P01",
          "S37"
        ]
      }
    },
    "A02": {
      "id": "A02",
      "name": "競技：腱板断裂",
      "notes": "G1/G2。全層断裂へ腱障害ガイドラインを無条件外挿しない",
      "levels": {
        "beginner": [
          "S01",
          "S02",
          "S03",
          "S04",
          "S05",
          "S23"
        ],
        "intermediate": [
          "S08",
          "S09",
          "S10",
          "S11",
          "S12",
          "S15",
          "S30"
        ],
        "advanced": [
          "S17",
          "S20",
          "S25",
          "S26",
          "P01",
          "S37"
        ]
      }
    },
    "A03": {
      "id": "A03",
      "name": "競技：前方脱臼後",
      "notes": "G1/G2。接触競技の許可は別判断",
      "levels": {
        "beginner": [
          "S23",
          "S05",
          "S02",
          "S04",
          "S07"
        ],
        "intermediate": [
          "S08",
          "S09",
          "S10",
          "S11",
          "S12",
          "S14",
          "S30"
        ],
        "advanced": [
          "S25",
          "S18",
          "S20",
          "S26",
          "P01",
          "S37"
        ]
      }
    },
    "A04": {
      "id": "A04",
      "name": "競技：SLAP損傷",
      "notes": "G1/G3。投球・牽引・二頭筋負荷を別々に確認",
      "levels": {
        "beginner": [
          "S23",
          "S05",
          "S02",
          "S04",
          "S07"
        ],
        "intermediate": [
          "S08",
          "S09",
          "S10",
          "S11",
          "S12",
          "S24",
          "S30"
        ],
        "advanced": [
          "S25",
          "S17",
          "S20",
          "S24",
          "P01"
        ]
      }
    },
    "A05": {
      "id": "A05",
      "name": "競技：テニス肘",
      "notes": "握り、回内外、反復スイングの許容量を管理",
      "levels": {
        "beginner": [
          "E01",
          "E02",
          "E03",
          "E04",
          "E05",
          "S05"
        ],
        "intermediate": [
          "E06",
          "E07",
          "E08",
          "E09",
          "S12",
          "S13"
        ],
        "advanced": [
          "E10",
          "E08",
          "E09",
          "S20",
          "S21"
        ]
      }
    },
    "A06": {
      "id": "A06",
      "name": "競技：外側足関節捻挫",
      "notes": "G4/G7。疼痛・筋力/ROM・感覚運動・自信・競技機能を総合評価",
      "levels": {
        "beginner": [
          "A01",
          "A02",
          "A03",
          "A04",
          "A05",
          "K23",
          "A11"
        ],
        "intermediate": [
          "A06",
          "A07",
          "K08",
          "K11",
          "K09",
          "A08",
          "A13",
          "A15"
        ],
        "advanced": [
          "K16",
          "P04",
          "P05",
          "P06",
          "P07",
          "P08",
          "P12",
          "P13"
        ]
      }
    },
    "A07": {
      "id": "A07",
      "name": "競技：半月板損傷",
      "notes": "G4/G7。膝の腫脹・ロッキング・術式を優先",
      "levels": {
        "beginner": [
          "K01",
          "K02",
          "K03",
          "K04",
          "K05",
          "T08"
        ],
        "intermediate": [
          "K07",
          "K09",
          "K10",
          "K11",
          "K14",
          "K18",
          "K26"
        ],
        "advanced": [
          "K15",
          "P04",
          "P05",
          "P06",
          "P07",
          "P08"
        ]
      }
    },
    "A08": {
      "id": "A08",
      "name": "競技：非特異的腰痛",
      "notes": "体幹運動だけでなく荷物・走跳・競技量へ段階的に移行",
      "levels": {
        "beginner": [
          "T01",
          "T02",
          "T03",
          "T04",
          "T05",
          "T10"
        ],
        "intermediate": [
          "T06",
          "T07",
          "T08",
          "T09",
          "K07",
          "T19",
          "T25"
        ],
        "advanced": [
          "T11",
          "T12",
          "T14",
          "K18",
          "T20",
          "P07",
          "T26"
        ]
      }
    },
    "A09": {
      "id": "A09",
      "name": "競技：腰椎椎間板ヘルニア",
      "notes": "G5/G7。症状末梢化・進行性神経症状を確認",
      "levels": {
        "beginner": [
          "T01",
          "T02",
          "T17",
          "T18",
          "K20",
          "T10"
        ],
        "intermediate": [
          "T06",
          "T07",
          "T08",
          "T09",
          "K07",
          "T19",
          "T25"
        ],
        "advanced": [
          "T11",
          "T12",
          "T14",
          "K18",
          "T20",
          "P07",
          "T26"
        ]
      }
    },
    "A10": {
      "id": "A10",
      "name": "競技：腰椎分離症（保護期・運動許可後）",
      "notes": "G6。許可範囲内で低衝撃・体幹制御、伸展回旋や走跳は未許可なら不可",
      "levels": {
        "beginner": [
          "T01",
          "T02",
          "T21",
          "T22",
          "K05",
          "A05"
        ],
        "intermediate": [
          "T06",
          "T23",
          "T09",
          "T08",
          "K06",
          "T10",
          "T25",
          "K26"
        ],
        "advanced": [
          "T07",
          "T11",
          "T12",
          "K14",
          "K18",
          "K21",
          "T26"
        ]
      }
    },
    "A11": {
      "id": "A11",
      "name": "競技：腰椎分離症（負荷再開許可後）",
      "notes": "G6/G7。基本筋力から走跳、伸展回旋、競技量へ。開始日だけで進級しない",
      "levels": {
        "beginner": [
          "T06",
          "T07",
          "T08",
          "T09",
          "K07",
          "T10",
          "T25"
        ],
        "intermediate": [
          "T11",
          "T12",
          "K14",
          "K18",
          "T19",
          "T20",
          "T26"
        ],
        "advanced": [
          "P09",
          "P04",
          "P06",
          "P07",
          "P08"
        ]
      }
    }
  },
  "presets": {
    "R": "5〜10回×1セット、1日1〜2回。終末域へ強制しない",
    "S": "10〜20秒×2回、1日1回。刺激性が高い場合は短縮または除外",
    "I": "5秒×5回、1日1回。息を止めず最大努力をしない",
    "M": "8〜12回×1〜2セット、週2〜3日を出発点。セット間60〜90秒。強い同部位負荷は連日避ける",
    "B": "10〜20秒×3回、週3〜5日。必ず支持物を近くに置く",
    "C": "保持5〜10秒×5回または左右各5回、週3〜5日。息を止めない",
    "W": "合計5分程度から、週3〜5日。短い区間に分割可。会話できる強度",
    "P": "辞書の少量案を上限候補としてPTが初回監督下で調整。週2回程度・原則48時間程度あけ、競技練習と合算"
  },
  "gates": {
    "G0": "通常のPT評価・処方。追加の病期ゲートなし",
    "G1": "肩の挙上角度・外旋角度・自動/介助運動・抵抗の許可を記録。診断により医師指示を優先",
    "G2": "肩の高い挙上位・外転外旋位を個別に許可。脱臼不安感を確認",
    "G3": "上腕二頭筋の抵抗・牽引負荷を個別に許可。SLAP修復・腱固定術等では主治医指示",
    "G4": "下肢荷重・膝屈曲範囲・衝撃負荷の許可をそれぞれ記録",
    "G5": "神経症状を評価。方向運動は方向・範囲・反応を記録。症状末梢化なら中止",
    "G6": "腰椎分離症の現在の活動許可・装具・伸展/回旋/衝撃制限を記録",
    "G7": "競技準備の該当動作をPT監督下で確認し、回数・速度・場所・休息を具体的に処方",
    "G8": "家庭に安全な器具・固定点・歩行空間がある。無ければ代替運動を選ぶ"
  },
  "selectionReview": {
    "date": "2026-09-26",
    "kind": "AI evidence-informed design review; individual prescribing remains with the treating clinician",
    "added": [
      "S30",
      "S37",
      "N12",
      "T25",
      "T26",
      "K26",
      "K38",
      "A11",
      "A13",
      "A15",
      "P12",
      "P13"
    ]
  },
  "references": {
    "R5": "Desmeules F, et al. Rotator cuff tendinopathy diagnosis, non-surgical medical care and rehabilitation: a clinical practice guideline. J Orthop Sports Phys Ther. 2025. doi:10.2519/jospt.2025.13182",
    "R6": "Kuhn JE, et al; MOON Shoulder Group. Effectiveness of physical therapy in treating atraumatic full-thickness rotator cuff tears. J Shoulder Elbow Surg. 2013;22(10):1371-1379.",
    "R16": "Wilk KE, et al. The Advanced Throwers Ten Exercise Program: a new exercise series for enhanced dynamic shoulder control in the overhead throwing athlete. Phys Sportsmed. 2011;39(4):90-97.",
    "R9": "Blanpied PR, et al. Neck pain: revision 2017. J Orthop Sports Phys Ther. 2017;47(7):A1-A83.",
    "R3": "George SZ, et al. Interventions for the management of acute and chronic low back pain: revision 2021. J Orthop Sports Phys Ther. 2021;51(11):CPG1-CPG60.",
    "R4": "Bannuru RR, et al. OARSI guidelines for the non-surgical management of knee, hip, and polyarticular osteoarthritis. Osteoarthritis Cartilage. 2019;27(11):1578-1589.",
    "R8": "Logerstedt DS, et al. Knee pain and mobility impairments: meniscal and articular cartilage lesions revision 2018. J Orthop Sports Phys Ther. 2018;48(2):A1-A50.",
    "R18": "Kolasinski SL, et al. 2019 American College of Rheumatology/Arthritis Foundation guideline for the management of osteoarthritis of the hand, hip, and knee. Arthritis Rheumatol. 2020;72(2):220-233.",
    "R14": "Martin RL, et al. Ankle stability and movement coordination impairments: lateral ankle ligament sprains revision 2021. J Orthop Sports Phys Ther. 2021;51(4):CPG1-CPG80.",
    "R15": "Hupperets MDW, Verhagen EALM, van Mechelen W. Effect of unsupervised home based proprioceptive training on recurrences of ankle sprain: randomised controlled trial. BMJ. 2009;339:b2684.",
    "R23": "Ardern CL, et al. 2016 Consensus statement on return to sport from the First World Congress in Sports Physical Therapy, Bern. Br J Sports Med. 2016;50(14):853-864.",
    "R24": "Soligard T, et al. Comprehensive warm-up programme to prevent injuries in young female footballers: cluster randomised controlled trial. BMJ. 2008;337:a2469."
  }
};
if(typeof module!=="undefined"&&module.exports)module.exports=data;else root.ClinicalCatalog=data;
})(globalThis);
