import React, { useContext } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { ThemeContext, t } from '../../../../../contexts/ThemeContext';
import { Poll } from '../../../../../api/Posts';


export default function PollViewer({ poll }: { poll: Poll }) {
  const theme = useContext(ThemeContext);
  const [selectedOption, setSelectedOption] = React.useState<number|undefined>(undefined);

  return (
    <TouchableWithoutFeedback>
      <View style={t(styles.pollContainer, {
        borderColor: theme.tint,
      })}>
        <View style={t(styles.voteCountContainer, {
          borderColor: theme.tint,
        })}>
          <Text style={t(styles.pollText, {
            color: theme.subtleText,
          })}>
            {poll.voteCount.toLocaleString()} votes
          </Text>
        </View>
        <View
          style={t(styles.pollInnerContainer, {
            borderColor: theme.tint,
          })}
          onStartShouldSetResponder={e => false}
        >
          {poll.options.map((option, i) => (
            <TouchableOpacity
              key={i}
              style={styles.pollItem}
              activeOpacity={0.8}
              onPress={a => setSelectedOption(i) }
              hitSlop={10}
            >
              <View style={t(styles.radioButton, {
                borderColor: theme.subtleText,
                backgroundColor: theme.tint
              })}>
                {selectedOption === i &&
                  <View style={t(styles.radioButtonInner, {
                    backgroundColor: theme.iconPrimary,
                  })}/>
                }
              </View>
              <View style={styles.pollTextContainer}>
                <Text style={t(styles.pollText, {
                  color: theme.text,
                })}>
                  {option.text}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
        <View style={t(styles.voteButtonContainer, {
          borderColor: theme.tint,
        })}>
          <TouchableOpacity
            style={t(styles.voteButton, {
              backgroundColor: theme.tint,
            })}
            activeOpacity={0.8}
            onPress={() => alert('voted')}
            hitSlop={10}
          >
            <Text style={t(styles.voteButtonText, {
              color: theme.buttonText,
            })}>
              Vote
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  pollContainer: {
    flex: 1,
    borderWidth: 2,
    borderRadius: 5,
  },
  voteCountContainer: {
    padding: 5,
    paddingLeft: 10,
    borderBottomWidth: 2,
  },
  voteCountText: {

  },
  pollInnerContainer: {
    flex: 1,
    padding: 10,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderRadius: 100,
    padding: 2,
    marginRight: 10,
  },
  radioButtonInner: {
    flex: 1,
    width: '100%',
    borderRadius: 100,
  },
  pollItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 5,
  },
  pollTextContainer: {
    flex: 1,
  },
  pollText: {

  },
  voteButtonContainer: {
    padding: 5,
    borderTopWidth: 2,
    alignItems: 'center',
  },
  voteButton: {
    width: 150,
    height: 30,
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voteButtonText: {
    fontWeight: '600',
  },
});
