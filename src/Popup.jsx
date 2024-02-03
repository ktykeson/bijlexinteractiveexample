const Popup = ({ message, confirm }) => {
	return (
		<div className="dialog_box">
			<h2 className="dialog_message">{message}</h2>
			<button onClick={confirm} className="dialog_confirmation" type="button">
				OK
			</button>
		</div>
	);
};

export default Popup;
