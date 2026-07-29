import { useState } from "react";

const Swatch = ({ color, selected, onClick, size = "w-6 h-6" }) => (
  <button
    type="button"
    onClick={onClick}
    title={color}
    disabled={selected}
    className={`${size} rounded-full border-2 transition-all ${
      selected
        ? "border-black cursor-default"
        : "border-gray-300 hover:border-gray-500"
    }`}
    style={{ backgroundColor: color.toLowerCase() }}
  />
);

const ColorPicker = ({ label, options, selected, onSelect }) => {
  const otherOptions = options.filter((c) => c !== selected);

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-gray-700">{label}</span>
      <div className="flex items-center gap-3">
        <Swatch color={selected} selected size="w-8 h-8" />

        {otherOptions.length > 0 && (
          <>
            <div className="w-px h-6 bg-gray-300" />
            <div className="flex items-center gap-2">
              {otherOptions.map((color) => (
                <Swatch
                  key={color}
                  color={color}
                  selected={false}
                  onClick={() => onSelect(color)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const CartItemCard = ({ item, onUpdate, onRemove }) => {
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const { vehicle } = item;

  const handleColorChange = async (field, value) => {
    setError("");
    setUpdating(true);
    try {
      await onUpdate(item.id, { [field]: value });
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  const handleRemove = async () => {
    setError("");
    setUpdating(true);
    try {
      await onRemove(item.id);
    } catch (err) {
      setError(err.message);
      setUpdating(false);
    }
  };

  const image = vehicle.imageUrls?.[0];

  return (
    <div className="border border-black rounded-2xl shadow-sm p-3 flex gap-5">
      <div className="w-40 max-w-40 self-stretch rounded-xl overflow-hidden shrink-0 bg-gray-100 flex items-center justify-center">
        {image ? (
          <img
            src={image}
            alt={`${vehicle.brand} ${vehicle.model}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="text-xs text-gray-400">No image</span>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-3 py-2 pr-2">
        <div className="flex items-start justify-between">
          <div>
            <span className="font-semibold text-black">
              {vehicle.brand} {vehicle.model}
            </span>
            <span className="text-sm text-gray-500 block">
              ${vehicle.price.toLocaleString()}
            </span>
          </div>
          <button
            onClick={handleRemove}
            disabled={updating}
            className="text-sm text-gray-500 hover:text-red-600 disabled:opacity-40"
          >
            Remove
          </button>
        </div>

        <div className="flex items-center gap-6">
          <ColorPicker
            label="Color"
            options={vehicle.availableColors || []}
            selected={item.selectedColor}
            onSelect={(color) => handleColorChange("selectedColor", color)}
          />

          <div className="w-px h-14 bg-gray-300" />

          <ColorPicker
            label="Interior Color"
            options={vehicle.availableInteriorColors || []}
            selected={item.selectedInteriorColor}
            onSelect={(color) =>
              handleColorChange("selectedInteriorColor", color)
            }
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>
    </div>
  );
};

export default CartItemCard;
