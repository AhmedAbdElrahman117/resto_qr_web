'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const encodedSubject = encodeURIComponent(title || 'New inquiry from RestoQR');
    const encodedBody = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\n${body}`);
    window.location.href = `mailto:support@restoqr.app?subject=${encodedSubject}&body=${encodedBody}`;
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="landing-contact-form"
    >
      <div className="landing-contact-row">
        <div className="landing-contact-group">
          <label htmlFor="name" className="landing-contact-label">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="landing-contact-input"
            placeholder="Jane Doe"
          />
        </div>
        <div className="landing-contact-group">
          <label htmlFor="email" className="landing-contact-label">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="landing-contact-input"
            placeholder="jane@example.com"
          />
        </div>
      </div>
      
      <div className="landing-contact-group">
        <label htmlFor="title" className="landing-contact-label">
          Title
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="landing-contact-input"
          placeholder="How can we help?"
        />
      </div>

      <div className="landing-contact-group">
        <label htmlFor="body" className="landing-contact-label">
          Message
        </label>
        <textarea
          id="body"
          required
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="landing-contact-textarea"
          placeholder="Write your message here..."
        />
      </div>

      <button
        type="submit"
        className="landing-primary landing-contact-submit"
      >
        Send Email
      </button>
    </form>
  );
}
