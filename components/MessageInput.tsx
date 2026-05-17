type MessageInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
};

export default function MessageInput({
  value,
  onChange,
  onSend,
  onKeyDown,
}: MessageInputProps) {
  return (
    <div className="p-3 border-t border-[#222] flex gap-2 bg-[#111b21]">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Type a message"
        className="flex-1 p-3 rounded-full bg-[#202c33] outline-none text-white"
      />

      <button
        onClick={onSend}
        className="bg-[#25D366] text-black px-5 rounded-full font-semibold"
      >
        Send
      </button>
    </div>
  );
}
