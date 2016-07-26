$translate(['STOMT_BECAUSE', 'STOMT_WOULD']).then(function(translation) {stomtBecause = translation.STOMT_BECAUSE;stomtWould = translation.STOMT_WOULD;replaceText = ['', stomtWould, stomtWould + ' ', stomtWould + '&nbsp;', stomtBecause, stomtBecause + ' ', stomtBecause + '&nbsp;'];});
<span class="test" translate>STOMT_BECAUSE</span>
<span translate='STOMT_BECAUSE'></span>
<div class="option-text">{{::\'STOMT_BECAUSE\'| translate}}</div>",STOMT_BECAUSE:"Privacy Policy"