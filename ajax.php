<?
$arAnswer = array( "isValid" => true );
if(isset($_POST['value'])){
	$names = array(
		'дима',
		'оля',		
		'бронислав',
		'маша',
		'ваня',
		'иван',
		'антон',
		'юра',
		'алексей',
	);
	
	$postName = trim(mb_convert_case($_POST['value'], MB_CASE_LOWER, "UTF-8"));
	$ifAlreadyIn = array_search($postName, $names) !== false;

	if($ifAlreadyIn) {
		$arAnswer["isValid"] = false;
		$arAnswer["error"] = 'Такое имя уже существует';
	}
} 
//имитируем бурную деятельность
$test = 1;
for ($i=0; $i < 30000000; $i++) { 
	$test = $test*$i;
}
echo json_encode($arAnswer);
?>