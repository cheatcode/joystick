const float_to_decimal_place = (float = 0, decimal_place = 2) => {
	return parseFloat(float.toFixed(decimal_place), 10);
};

export default float_to_decimal_place;
