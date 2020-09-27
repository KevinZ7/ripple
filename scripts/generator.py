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
            cmd = 'INSERT INTO ripple.user (username, age) VALUES ({username}, {age});\n'.format(username=username, age=age)
            f.write(cmd)

            # create description
            description = np.random.choice(df.content).split(' ')
            indices = np.random.randint(len(description), size=10)
            for i in indices:
                description[i] = np.random.choice(words)
            description = ' '.join(description).replace('\'', '\'\'')
            cmd = 'INSERT INTO ripple.description (description, userid) VALUES (\'{description}\', {userid});\n'.format(description=description, userid=username)
            f.write(cmd)

        f.close()


generateData(100)