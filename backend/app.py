from flask import Flask, request, jsonify, session
from flask_cors import CORS
import random
import requests
import os

app = Flask(__name__)
CORS(app)

# Secret key required for session handling
app.secret_key = os.environ.get("SECRET_KEY", "your-dev-secret")

MAX_TRIES = 6

def get_feedback(guess, target):
    feedback = ['gray'] * 5
    target_chars = list(target)

    # First pass: green (correct letter and position)
    for i in range(5):
        if guess[i] == target[i]:
            feedback[i] = 'green'
            target_chars[i] = None

    # Second pass: yellow (correct letter, wrong position)
    for i in range(5):
        if feedback[i] == 'gray' and guess[i] in target_chars:
            feedback[i] = 'yellow'
            target_chars[target_chars.index(guess[i])] = None

    return feedback

@app.route('/get-word', methods=['GET'])
def get_word():
    try:
        # Get 5-letter words from Datamuse
        response = requests.get('https://api.datamuse.com/words?sp=?????&max=1000')
        word_list = [w['word'].lower() for w in response.json() if len(w['word']) == 5 and w['word'].isalpha()]

        if not word_list:
            return jsonify({'error': 'No valid words found'}), 500

        target_word = random.choice(word_list)
        session['target_word'] = target_word
        session['attempt_counter'] = 0

        return jsonify({'message': 'New word set from API. You have 6 tries.'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/check-guess', methods=['POST'])
def check_guess():
    target_word = session.get('target_word')
    attempt_counter = session.get('attempt_counter', 0)

    if not target_word:
        return jsonify({'error': 'Game not started'}), 400

    data = request.get_json()
    guess = data.get('guess', '').lower()

    # Check format
    if len(guess) != 5 or not guess.isalpha():
        return jsonify({'error': 'Invalid word format'}), 400

    # Check if guess is a valid word (via Datamuse)
    try:
        check_response = requests.get(f'https://api.datamuse.com/words?sp={guess}')
        valid_words = [w['word'] for w in check_response.json()]
        if guess not in valid_words:
            return jsonify({'error': 'Word not found in dictionary'}), 400
    except Exception:
        return jsonify({'error': 'Validation failed'}), 500

    # Max attempt check
    if attempt_counter >= MAX_TRIES:
        return jsonify({'error': 'No attempts left', 'game_over': True, 'target_word': target_word}), 403

    attempt_counter += 1
    session['attempt_counter'] = attempt_counter

    feedback = get_feedback(guess, target_word)

    if guess == target_word:
        return jsonify({
            'guess': guess,
            'feedback': feedback,
            'success': True,
            'remaining': MAX_TRIES - attempt_counter,
            'target_word': target_word
        })

    game_over = attempt_counter >= MAX_TRIES
    return jsonify({
        'guess': guess,
        'feedback': feedback,
        'success': False,
        'remaining': MAX_TRIES - attempt_counter,
        'game_over': game_over,
        'target_word': target_word if game_over else None
    })

if __name__ == '__main__':
    from waitress import serve
    port = int(os.environ.get("PORT", 8080))
    serve(app, host="0.0.0.0", port=port)
