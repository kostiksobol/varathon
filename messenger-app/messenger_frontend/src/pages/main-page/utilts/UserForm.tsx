import { HexString } from "@gear-js/api";


type UserFormProps = {
    address: HexString;
};

export function UserForm({address}: UserFormProps){
    return (
        <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '5px',
          marginBottom: '0.5rem',
          padding: '0.5rem',
          overflow: 'hidden',
          whiteSpace: 'normal',   // Allow text to wrap to the next line
          wordWrap: 'break-word', // Break words if they are too long to fit in one line
        }}
      >
        <div style={{ fontWeight: 'bold', color: '#ddd' }}>{address}</div>
      </div>
    )
}