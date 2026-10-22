function AddressForm({ value, onChange, onSubmit, submitLabel = "Save address" }) {
  function update(event) {
    onChange({ ...value, [event.target.name]: event.target.value });
  }
  return (
    <form className="address-form" onSubmit={onSubmit}>
      <label>Recipient name<input name="name" autoComplete="name" value={value.name ?? ""} onChange={update} required /></label>
      <label>Phone number<input name="phone" type="tel" autoComplete="tel" value={value.phone ?? ""} onChange={update} required /></label>
      <label>Address line 1<input name="line1" autoComplete="address-line1" value={value.line1 ?? ""} onChange={update} required /></label>
      <label>Address line 2 <span>(optional)</span><input name="line2" autoComplete="address-line2" value={value.line2 ?? ""} onChange={update} /></label>
      <div className="address-form-row"><label>City<input name="city" autoComplete="address-level2" value={value.city ?? ""} onChange={update} required /></label><label>State<input name="state" autoComplete="address-level1" value={value.state ?? ""} onChange={update} required /></label></div>
      <div className="address-form-row"><label>Postal code<input name="postalCode" autoComplete="postal-code" value={value.postalCode ?? ""} onChange={update} required /></label><label>Country<input name="country" autoComplete="country-name" value={value.country ?? ""} onChange={update} required /></label></div>
      <button className="primary-button" type="submit">{submitLabel}</button>
    </form>
  );
}

export default AddressForm;
