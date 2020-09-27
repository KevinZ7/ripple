import numpy as np
import pandas as pd
from sklearn.feature_extraction.text import CountVectorizer

def generateData(num):
    usernames = ['Dan', 'Lily', 'Derek', 'Sarah', 'Jenny', 'Bob', 'Parker']
    df = pd.read_csv('nlp/raw_data.tsv', sep='\t')
    vectorizer = CountVectorizer()
    X = vectorizer.fit_transform(df.content)
    words = vectorizer.get_feature_names()

    with open('data-scripts/insert.sql', 'w') as f:
        for i in range(num):
            # create user
            username = '\'{username}_{random}\''.format(username=np.random.choice(usernames), random=np.random.randint(1000))
            age = np.random.randint(50)
            cmd = 'INSERT INTO ripple.user (userid, age) VALUES ({username}, {age});\n'.format(username=username, age=age)
            f.write(cmd)

            # create description
            description = np.random.choice(df.content).split(' ')
            description = scrambleDescription(description, words)
            cmd = 'INSERT INTO ripple.description (content, since, userid) VALUES (\'{description}\', \'2020-09-26\', {userid});\n'.format(description=description, userid=username)
            f.write(cmd)
            cmd = 'INSERT INTO ripple.journal (journal, since, category, userid) VALUES (\'{description}\', \'2020-09-26\', \'description\', {userid});\n'.format(description=description, userid=username)
            f.write(cmd)

            # create journal entries
            for i in range(3):
                description = description.split(' ')
                description = scrambleDescription(description, words)
                cmd = 'INSERT INTO ripple.journal (journal, since, category, userid) VALUES (\'{journal}\', \'2020-09-2{num}\', \'journal\', {userid});\n'.format(journal=description, userid=username, num=(6-i))
                f.write(cmd)

        f.close()

def scrambleDescription(description, words):
    indices = np.random.randint(len(description), size=10)
    for i in indices:
        description[i] = np.random.choice(words)
    description = ' '.join(description).replace('\'', '\'\'')
    return description
generateData(20)