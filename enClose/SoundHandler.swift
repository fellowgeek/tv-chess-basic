//
//  SoundHandler.swift
//  Host Alerts
//
//  Created by Erfan Reed @ 2024
//

import AudioToolbox

class SoundHandler {
    var soundID: SystemSoundID = 0

    init(soundFileName: String, soundFileType: String) {
        if let soundURL = Bundle.main.url(forResource: soundFileName, withExtension: soundFileType) {
            AudioServicesCreateSystemSoundID(soundURL as CFURL, &soundID)
        } else {
            print("Sound file not found")
        }
    }

    func playSound() {
        AudioServicesPlaySystemSound(soundID)
    }

}